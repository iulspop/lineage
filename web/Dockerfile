FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++ && corepack enable
WORKDIR /app

FROM base AS dependencies-env
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts \
  && pnpm rebuild better-sqlite3

FROM base AS build-env
COPY --from=dependencies-env /app/node_modules ./node_modules
COPY . ./
ARG DATABASE_URL="file:/tmp/build.db"
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

FROM base
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY --from=build-env /app/generated ./generated
COPY public ./public
COPY prisma ./prisma
COPY prisma.config.ts ./
CMD ["pnpm", "start"]
