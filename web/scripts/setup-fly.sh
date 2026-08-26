#!/usr/bin/env bash
set -euo pipefail

# Setup Fly.io app, volume, Infisical-backed runtime secrets, and a deploy token.
# Secrets are read from Infisical prod /web, not from local .env files.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if ! command -v flyctl &>/dev/null; then
  echo "Error: flyctl is not installed. Install it from https://fly.io/docs/flyctl/install/"
  exit 1
fi

if ! command -v infisical &>/dev/null; then
  echo "Error: infisical CLI is not installed. Install it from https://infisical.com/docs/cli/overview."
  exit 1
fi

APP_NAME=$(grep '^app' "$ROOT_DIR/fly.toml" | head -1 | sed 's/app = "//;s/"//')
REGION=$(grep 'primary_region' "$ROOT_DIR/fly.toml" | head -1 | sed 's/primary_region = "//;s/"//')
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
INFISICAL_PATH="${INFISICAL_PATH:-/web}"

echo "==> Creating Fly app: $APP_NAME (region: $REGION)"
flyctl apps create "$APP_NAME" 2>/dev/null || echo "    App already exists, skipping."

echo "==> Creating volume: data (1GB in $REGION)"
flyctl volumes create data --region "$REGION" --size 1 --app "$APP_NAME" --yes 2>/dev/null || echo "    Volume already exists, skipping."

echo "==> Syncing Fly runtime secrets from Infisical $INFISICAL_ENV $INFISICAL_PATH"
infisical export --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --format=dotenv \
  | flyctl secrets import --app "$APP_NAME"

echo "==> Deploying to Fly"
flyctl deploy --remote-only --app "$APP_NAME"

echo "==> Verifying healthcheck"
curl -sf "https://${APP_NAME}.fly.dev/healthcheck" && echo " OK" || echo " FAILED"

REPO=$(cd "$ROOT_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -n "$REPO" ]; then
  echo "==> Create GitHub repo vars for Infisical OIDC:"
  echo "    gh variable set INFISICAL_IDENTITY_ID -R $REPO --body <identity-id>"
  echo "    gh variable set INFISICAL_PROJECT_SLUG -R $REPO --body <project-slug>"
  echo "==> Store Fly deploy token in Infisical prod /web as FLY_API_TOKEN:"
  echo "    flyctl tokens create deploy -x 999999h --app $APP_NAME"
else
  echo "==> No GitHub repo detected. Configure INFISICAL_IDENTITY_ID and INFISICAL_PROJECT_SLUG repo vars manually."
fi

echo ""
echo "==> Setup complete! App live at https://${APP_NAME}.fly.dev"
