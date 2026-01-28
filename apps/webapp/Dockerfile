ARG NODE_VERSION=24.5

ARG RELEASE_NAME
ARG SENTRY_DSN=""

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install corepack@latest -g
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY tsconfig.base.json /app/tsconfig.base.json
COPY libs /app/libs
COPY apps/webapp /app/apps/webapp

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter ./apps/webapp build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter ./apps/webapp deploy --prod pruned

# Build the source code

FROM deps AS builder

ARG RELEASE_NAME
ARG SENTRY_DSN

ENV NODE_ENV=production
ENV NEXT_PUBLIC_RELEASE_NAME=$RELEASE_NAME
ENV SENTRY_DSN=$SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN

RUN apt-get update && apt-get install -y ca-certificates

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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/pruned /app
RUN chown nextjs:nodejs /app

USER nextjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/dbg/health || exit 1

EXPOSE 3000

CMD ["node", "--run", "start:prod"]
