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
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS prod-deps
COPY apps/webapp/package.json /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Build the source code

FROM deps AS builder

ARG RELEASE_NAME
ARG SENTRY_DSN

ENV NODE_ENV=production
ENV NEXT_PUBLIC_RELEASE_NAME=$RELEASE_NAME
ENV SENTRY_DSN=$SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN

RUN apt-get update && apt-get install -y ca-certificates
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
  pnpm --filter ./apps/webapp run build

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

COPY --from=builder /app/apps/webapp /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
RUN chown nextjs:nodejs /app

USER nextjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/dbg/health || exit 1

EXPOSE 3000

CMD ["node", "--run", "start:prod"]
