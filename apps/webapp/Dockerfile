ARG NODE_VERSION=24.5
ARG RELEASE_NAME
ARG SENTRY_DSN=""

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
COPY libs/hubert/package.json                libs/hubert/
COPY libs/theme/package.json                 libs/theme/
COPY libs/storybook-addon-theme/package.json libs/storybook-addon-theme/
COPY apps/webapp/package.json                apps/webapp/

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
  bun install

COPY libs      ./libs
COPY apps/webapp ./apps/webapp

#
# BUILDER
#
FROM deps AS builder

ARG RELEASE_NAME
ARG SENTRY_DSN

ENV NODE_ENV=production
ENV NEXT_PUBLIC_RELEASE_NAME=$RELEASE_NAME
ENV SENTRY_DSN=$SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/webapp
RUN bun run build

#
# RUNNER - still node, maybe switch to bun in the future
#
FROM node:${NODE_VERSION}-alpine AS runner

LABEL org.opencontainers.image.source="https://github.com/lotta-schule/lotta"
LABEL org.opencontainers.image.authors="Lotta Schule <kontakt@lotta.schule>"
LABEL org.opencontainers.image.url="https://lotta.schule"

RUN apk add --no-cache libc6-compat

ARG RELEASE_NAME
ARG SENTRY_DSN

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV SENTRY_RELEASE=$RELEASE_NAME
ENV NEXT_PUBLIC_RELEASE_NAME=$RELEASE_NAME
ENV NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/webapp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webapp/.next/static     apps/webapp/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/webapp/public            apps/webapp/public

USER nextjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/dbg/health || exit 1

EXPOSE 3000

CMD ["node", "apps/webapp/server.js"]
