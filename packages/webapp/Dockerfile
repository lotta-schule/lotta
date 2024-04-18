ARG SENTRY_AUTH_TOKEN
ARG NODE_VERSION=20.12

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . /app

FROM base AS dev-deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM node:${NODE_VERSION}-slim AS prod-deps
WORKDIR /app
COPY packages/webapp/package.json ./
RUN npm install --production

# Build the source code
FROM dev-deps AS builder
RUN SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} pnpm --filter ./packages/webapp run build
RUN cat packages/webapp/next.config.js | sed -z 's/transpileModules: \[[^;]*\],\n//' > packages/webapp/next.config.js

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder /app/packages/webapp/package.json ./
COPY --from=builder /app/packages/webapp/next.config.js ./
COPY --from=builder /app/packages/webapp/public ./public
COPY --from=builder /app/packages/webapp/.next ./.next
COPY --from=builder /app/packages/webapp/server.js ./server.js
COPY --from=builder /app/packages/webapp/tracing.js ./tracing.js
COPY --from=prod-deps --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
