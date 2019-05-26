# Dockerfile for Medienportal API Server
FROM elixir:1.8.1-alpine as build

# build arguments
ARG APP_ENV=prod

ENV MIX_ENV prod

WORKDIR /app

RUN apk update && \
    apk add --no-cache \
    make \
    build-base

# Copy all source files
COPY rel ./rel
COPY config ./config
COPY lib ./lib
COPY priv ./priv
COPY mix.exs .
COPY mix.lock .

# Install hex (Elixir package manager)
RUN mix local.hex --force

# Install rebar (Erlang build tool)
RUN mix local.rebar --force

# install dependencies and build release
RUN mix deps.get && \
    mix release --env=${APP_ENV}

# unpack and copy release to /export
RUN RELEASE_DIR=`ls -d _build/prod/rel/api/releases/*/` && \
    mkdir /export && \
    tar -xf "$RELEASE_DIR/api.tar.gz" -C /export

FROM alpine

RUN apk update && \
    apk add --no-cache \
    bash \
    openssl-dev

WORKDIR /app

COPY --from=build /export .

ENTRYPOINT ["/app/bin/api"]

CMD ["foreground"]