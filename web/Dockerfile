FROM node:22-alpine AS base
ENV CI=true
RUN apk add --no-cache python3 make g++ && corepack enable
WORKDIR /app

FROM base AS dependencies-env
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/package.json
COPY web/package.json ./web/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts \
  && pnpm rebuild better-sqlite3

FROM base AS build-env
COPY --from=dependencies-env /app/node_modules ./node_modules
COPY --from=dependencies-env /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=dependencies-env /app/web/node_modules ./web/node_modules
COPY . ./
ARG DATABASE_URL="file:/tmp/build.db"
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

FROM base
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/package.json
COPY web/package.json ./web/package.json
COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/packages/core ./packages/core
COPY --from=build-env /app/web/build ./web/build
COPY --from=build-env /app/web/generated ./web/generated
COPY web/public ./web/public
COPY web/prisma ./web/prisma
COPY web/prisma.config.ts ./web/prisma.config.ts
CMD ["sh", "-c", "pnpm --filter lineage-web db:migrate:prod && pnpm --filter lineage-web start"]
