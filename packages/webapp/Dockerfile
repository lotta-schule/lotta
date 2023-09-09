ARG SENTRY_AUTH_TOKEN

FROM node:20.5-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# We have no package-lock and package-lock generation
# seems to be a bit messy with nx
# We will start not using it and see how it goes ...
# COPY package.json package-lock.json ./
# RUN npm ci
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:20.5-alpine AS builder
ARG SENTRY_AUTH_TOKEN
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} npm run build
RUN npm prune --production

FROM node:20.5-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/tracing.cjs ./tracing.cjs
COPY --from=builder /app/fetch.cjs ./fetch.cjs

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
