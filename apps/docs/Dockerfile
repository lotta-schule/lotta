ARG NODE_VERSION=24.5

#
# BASE
#
FROM oven/bun:1-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

#
# DEPS
#
FROM base AS deps

COPY bun.lock bunfig.toml package.json tsconfig.base.json ./
COPY apps/docs/package.json apps/docs/

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
  bun install

COPY CHANGELOG.md ./
COPY apps/docs ./apps/docs

#
# BUILDER
#
FROM deps AS builder

# Public slug of the GitHub App used by the Keystatic editor (not a secret).
# Baked into the editor UI at build time.
ARG PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=""
ENV PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=$PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
ENV ASTRO_TELEMETRY_DISABLED=1

WORKDIR /app/apps/docs
RUN bun run build

#
# PROD-DEPS - only the docs package's runtime dependencies, not the whole monorepo
#
FROM base AS prod-deps

COPY bun.lock bunfig.toml package.json ./
COPY apps/docs/package.json apps/docs/

# Strip the root manifest down to the docs workspace (keeping overrides), so the
# monorepo's root dependencies (Next.js etc.) are not installed; bun.lock still pins versions.
RUN bun -e 'const p = await Bun.file("package.json").json(); \
  await Bun.write("package.json", JSON.stringify({ name: p.name, private: true, \
  workspaces: ["apps/docs"], overrides: p.overrides }))'

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
  bun install --omit dev --ignore-scripts

#
# RUNNER
#
FROM node:${NODE_VERSION}-alpine AS runner

LABEL org.opencontainers.image.source="https://github.com/lotta-schule/lotta"
LABEL org.opencontainers.image.authors="Lotta Schule <kontakt@lotta.schule>"
LABEL org.opencontainers.image.url="https://docs.lotta.schule"

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Runtime secrets for the Keystatic editor (GitHub login), set on the container:
#   KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET, KEYSTATIC_SECRET

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 astro

COPY --from=prod-deps --chown=astro:nodejs /app/node_modules           ./node_modules
COPY --from=prod-deps --chown=astro:nodejs /app/apps/docs/node_modules ./apps/docs/node_modules
COPY --from=builder --chown=astro:nodejs /app/apps/docs/package.json  ./apps/docs/package.json
COPY --from=builder --chown=astro:nodejs /app/apps/docs/dist          ./apps/docs/dist

USER astro

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

EXPOSE 4321

CMD ["node", "apps/docs/dist/server/entry.mjs"]
