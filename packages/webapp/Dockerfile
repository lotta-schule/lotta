ARG NODE_VERSION=20.12
ARG RELEASE_NAME=""
ARG SENTRY_DSN=""

FROM node:${NODE_VERSION}-slim AS node-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV SENTRY_RELEASE=${RELEASE_NAME}
ENV RELEASE_NAME=${RELEASE_NAME}
RUN corepack enable
WORKDIR /app
COPY . /app

FROM node-base AS base
WORKDIR /app
COPY . /app

FROM base AS dev-deps
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM node-base AS prod-deps
WORKDIR /app
COPY packages/webapp/package.json ./
# no --frozen-lockfile because we do not have a single lockfile yet
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Build the source code
FROM dev-deps AS builder
ENV NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
RUN --mount=type=secret,id=sentry_auth_token \
  SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token) \
  pnpm --filter ./packages/webapp run build
RUN cat packages/webapp/next.config.js | sed -z 's/transpileModules: \[[^;]*\],\n//' > packages/webapp/next.config.js

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV SENTRY_RELEASE=${RELEASE_NAME}
ENV RELEASE_NAME=${RELEASE_NAME}

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder /app/packages/webapp/package.json ./
COPY --from=builder /app/packages/webapp/next.config.js ./
COPY --from=builder /app/packages/webapp/public ./public
COPY --from=builder /app/packages/webapp/.next ./.next
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "start"]
