#!/usr/bin/env bash
set -euo pipefail

# Idempotent Fly.io deploy script.
# Reads app name and region from fly.toml, creates app/volume if missing,
# syncs production runtime secrets from Infisical to Fly, then deploys.
# Production migrations run manually after deployment so the mounted /data
# volume is available.
#
# Usage:
#   ./scripts/deploy.sh

# --- Prerequisites -----------------------------------------------------------

if ! command -v flyctl &>/dev/null; then
  echo "Error: flyctl is not installed. Install it from https://fly.io/docs/flyctl/install/"
  exit 1
fi

if ! command -v infisical &>/dev/null; then
  echo "Error: infisical CLI is not installed. Install it from https://infisical.com/docs/cli/overview."
  exit 1
fi

if ! flyctl auth whoami &>/dev/null; then
  echo "Error: not authenticated with Fly.io. Run 'flyctl auth login' first."
  exit 1
fi

# --- Read config from fly.toml -----------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FLY_TOML="$PROJECT_DIR/fly.toml"

if [[ ! -f "$FLY_TOML" ]]; then
  echo "Error: fly.toml not found at $FLY_TOML"
  exit 1
fi

APP_NAME=$(grep '^app' "$FLY_TOML" | head -1 | sed 's/.*= *"\(.*\)"/\1/')
REGION=$(grep '^primary_region' "$FLY_TOML" | head -1 | sed 's/.*= *"\(.*\)"/\1/')

INFISICAL_ENV="${INFISICAL_ENV:-prod}"
INFISICAL_PATH="${INFISICAL_PATH:-/web}"

echo "App:            $APP_NAME"
echo "Region:         $REGION"
echo "Infisical env:  $INFISICAL_ENV"
echo "Infisical path: $INFISICAL_PATH"

# --- Create app if it doesn't exist ------------------------------------------

if flyctl apps list --json | grep -q "\"$APP_NAME\""; then
  echo "App '$APP_NAME' already exists."
else
  echo "Creating app '$APP_NAME'..."
  flyctl apps create "$APP_NAME" --org personal
fi

# --- Create volume if it doesn't exist ---------------------------------------

if flyctl volumes list --app "$APP_NAME" --json | grep -q '"name":"data"'; then
  echo "Volume 'data' already exists."
else
  echo "Creating volume 'data' (1GB) in $REGION..."
  flyctl volumes create data --app "$APP_NAME" --region "$REGION" --size 1 --yes
fi

# --- Sync runtime secrets -----------------------------------------------------

echo "Syncing Fly runtime secrets from Infisical..."
infisical export --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --format=dotenv \
  | flyctl secrets import --app "$APP_NAME" --stage

# --- Deploy -------------------------------------------------------------------

echo "Deploying..."
flyctl deploy --app "$APP_NAME" --config "$FLY_TOML"

echo ""
echo "Deploy complete!"
echo ""
echo "Run production migrations on the Fly machine:"
echo "  flyctl ssh console --app $APP_NAME -C \"sh -lc 'cd /app && pnpm db:migrate:prod'\""
echo ""
echo "Next steps (first deploy only):"
echo "  1. Create GitHub repo vars INFISICAL_IDENTITY_ID and INFISICAL_PROJECT_SLUG"
echo "  2. Add Infisical prod /web secret FLY_API_TOKEN for CI deploys"
