ARG NODE_VERSION=22.2
ARG RELEASE_NAME
ARG SENTRY_DSN

FROM node:${NODE_VERSION}-slim AS node-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV SENTRY_RELEASE=${RELEASE_NAME}
ENV RELEASE_NAME=${RELEASE_NAME}
RUN apt-get update && apt-get install -y ca-certificates
RUN corepack enable
WORKDIR /app
COPY . /app

FROM node-base AS base
WORKDIR /app
COPY . /app

FROM base AS dev-deps
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the source code
FROM dev-deps AS builder
ENV NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
RUN --mount=type=secret,id=sentry_auth_token \
  SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token) \
  pnpm --filter ./packages/webapp run build
RUN cat packages/webapp/next.config.js | sed -z 's/transpileModules: \[[^;]*\],\n//' > packages/webapp/next.config.js

FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV production
ENV SENTRY_RELEASE=${RELEASE_NAME}
ENV RELEASE_NAME=${RELEASE_NAME}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/webapp/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/packages/webapp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/webapp/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
