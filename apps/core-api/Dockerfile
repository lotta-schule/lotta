# The version of Alpine to use for the final image
# This should match the version of Alpine that the `elixir:1.7.2-alpine` image uses
ARG ALPINE_VERSION=3.9

FROM elixir:1.8-alpine AS builder

# The environment to build with
ARG MIX_ENV=prod

ENV MIX_ENV=${MIX_ENV}

# By convention, /opt is typically used for applications
WORKDIR /opt/app

# This step installs all the build tools we'll need
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
    git \
    build-base \
    erlang-inets

RUN mix local.rebar --force && \
    mix local.hex --force

# This copies our app source code into the build container
COPY . .

RUN mix do deps.get, deps.compile, compile

RUN mix release --env=prod

RUN RELEASE_DIR=`ls -d1 _build/prod/rel/api/releases/*/ | head -1` && \
    mkdir -p /opt/built && \
    cp ${RELEASE_DIR}/api.tar.gz /opt/built && \
    cd /opt/built && \
    tar -xzf api.tar.gz && \
    rm api.tar.gz

# From this line onwards, we're in a new image, which will be the image used in production
FROM alpine:${ALPINE_VERSION}

RUN apk update && \
    apk add --no-cache \
    bash \
    openssl-dev \
    erlang-crypto \
    libssl1.1

ENV REPLACE_OS_VARS=true

WORKDIR /opt/app

COPY --from=builder /opt/built .

ENTRYPOINT ["/opt/app/bin/api"]

CMD ["foreground"]