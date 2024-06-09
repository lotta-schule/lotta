ARG NODE_VERSION=22.2
ARG RELEASE_NAME
ARG SENTRY_DSN

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV SENTRY_RELEASE=${RELEASE_NAME}
ENV RELEASE_NAME=${RELEASE_NAME}
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS prod-deps
COPY packages/webapp/package.json /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Build the source code
FROM deps AS builder
RUN apt-get update && apt-get install -y ca-certificates
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

COPY --from=builder /app/packages/webapp /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
RUN chown nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "--run", "start:prod"]
