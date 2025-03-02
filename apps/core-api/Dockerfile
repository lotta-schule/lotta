# The version of Alpine to use for the final image
ARG ALPINE_VERSION=3.19
ARG VIPS_VERSION=8.16.0

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

ARG VIPS_VERSION
ENV LANG=C.UTF-8

RUN apk update

ENV VIPSHOME="/tmp/vips-${VIPS_VERSION}"

RUN apk update && \
  apk add --no-cache \
  xz meson

RUN wget https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz \
  && tar -xf vips-${VIPS_VERSION}.tar.xz \
  && mv vips-${VIPS_VERSION} /tmp

RUN apk add --no-cache \
  openssl-dev \
  libssl3 \
  libstdc++ \
  # For meson
  build-base \
  gobject-introspection-dev \
  # For libvips
  vips-dev \
  fftw-dev \
  libheif-dev \
  openexr-dev \
  libgsf-dev \
  glib-dev \
  tiff-dev \
  libspng-dev \
  cgif-dev \
  libaio-dev \
  libwebp-dev \
  libjpeg-turbo-dev \
  openjpeg-dev \
  libjxl-dev \
  expat-dev expat \
  libexif-dev \
  tiff-dev \
  librsvg-dev \
  pango-dev pango \
  libimagequant-dev \
  highway-dev

RUN wget https://github.com/bblanchon/pdfium-binaries/releases/latest/download/pdfium-linux-musl-arm64.tgz && \
  tar xf pdfium-linux-musl-arm64.tgz

COPY <<EOF $VIPSHOME/lib/pkgconfig/pdfium.pc
prefix=$VIPSHOME
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include
Name: pdfium
Description: pdfium
Version: 4290
Requires:
Libs: -L\${libdir} -lpdfium
Cflags: -I\${includedir}
EOF

RUN cd /tmp/vips-${VIPS_VERSION} \
  && meson setup build-dir \
  && cd build-dir \
  && meson compile \
  && meson install

RUN mkdir -p /app
WORKDIR /app

COPY --from=builder /app/_build/prod/rel/lotta ./
RUN chown -R nobody: /app
USER nobody

ENV HOME=/app

ENTRYPOINT ["bin/lotta"]

CMD ["start"]
