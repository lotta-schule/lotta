# The version of Alpine to use for the final image
ARG ALPINE_VERSION=3.19

FROM elixir:1.17.1-otp-26-alpine AS builder

ENV MIX_ENV=prod

RUN mkdir -p /app
WORKDIR /app

# This step installs all the build tools we'll need
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
    git build-base

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# set build ENV
ENV MIX_ENV=prod
ENV ERL_AFLAGS="+JPperf true"

# install mix dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix deps.get --only prod
RUN mix deps.compile

# Compress source code for sentry
RUN mix sentry.package_source_code

# build project
COPY priv priv
COPY lib lib

# build release
COPY rel rel
RUN mix compile
RUN mix release

# From this line onwards, we're in a new image, which will be the image used in production
FROM alpine:${ALPINE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/lotta-schule/lotta"
LABEL org.opencontainers.image.authors="Lotta Schule <kontakt@lotta.schule>"
LABEL org.opencontainers.image.url="https://lotta.schule"

EXPOSE 4000

ENV LANG=C.UTF-8

RUN apk update && \
    apk add --no-cache \
    bash \
    curl \
    openssl-dev \
    libssl3 \
    libstdc++

RUN mkdir -p /app
WORKDIR /app

COPY --from=builder /app/_build/prod/rel/lotta ./
RUN chown -R nobody: /app
USER nobody

ENV HOME=/app

ENTRYPOINT ["bin/lotta"]

CMD ["start"]
