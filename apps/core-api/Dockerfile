# The version of Alpine to use for the final image
ARG ALPINE_VERSION="3.22"
ARG ELIXIR_VERSION="v1.18.4"
ARG OTP_VERSION="28.0.2"
ARG REBAR3_VERSION="3.25.0"
ARG PDFIUM_VERSION="chromium%2F7047"
ARG VIPS_VERSION="8.17.0"

ARG SENTRY_DSN=""

FROM alpine:${ALPINE_VERSION} AS base

ARG PDFIUM_VERSION
ARG VIPS_VERSION
ENV LANG=C.UTF-8
# output all criticals to stderr
ENV G_DEBUG=fatal-criticals
# Output possible memory leaks
ENV VIPS_LEAK=true
# Use custom libvips
ENV VIX_COMPILATION_MODE=PLATFORM_PROVIDED_LIBVIPS

RUN apk update

ARG VIPSHOME="/tmp/vips"
ENV PKG_CONFIG_PATH="${VIPSHOME}/lib/pkgconfig"

RUN mkdir -p $(dirname ${VIPSHOME})

RUN set -xe && \
  apk update && apk add --no-cache \
  openssl-dev \
  libc-dev \
  libssl3 \
  libstdc++ \
  build-base \
  # ffmpeg
  ffmpeg \
  # For libvips
  fftw-dev \
  libheif \
  libheif-dev \
  libheif-tools \
  libde265 \
  libde265-dev \
  dav1d \
  dav1d-dev \
  x265 \
  aom-dev \
  aom-libs \
  aom \
  imagemagick-dev \
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
  highway-dev \
  && apk add --no-cache --virtual .build-deps \
  curl \
  ca-certificates \
  gobject-introspection-dev \
  xz \
  meson \
  && curl -fSL -o vips.tar.xz "https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz" \
  && tar -xf vips.tar.xz \
  && mv vips-${VIPS_VERSION} ${VIPSHOME} && \
  case "$(apk --print-arch)" in \
  *x*) export arch="x64"     ;; \
  *)   export arch="arm64"   ;; \
  esac && \
  export file_name="pdfium-linux-musl-$arch.tgz" && \
  curl -fSL -o pdfium "https://github.com/bblanchon/pdfium-binaries/releases/download/${PDFIUM_VERSION}/$file_name" && \
  tar xf pdfium -C $VIPSHOME

COPY <<EOF ${VIPSHOME}/lib/pkgconfig/pdfium.pc
prefix=${VIPSHOME}
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

RUN cd ${VIPSHOME} \
  && meson setup build-dir \
  && cd build-dir \
  && meson compile \
  && meson install \
  && cp ${VIPSHOME}/lib/libpdfium.so /usr/local/lib/ \
  && ldconfig /usr/local/lib

RUN apk del .build-deps

# Taken from https://github.com/erlang/docker-erlang-otp/blob/31b38022c405588392cfb37ff4ccb0cff92873ea/26/alpine/Dockerfile
FROM base AS erlang

ARG OTP_VERSION
ARG REBAR3_VERSION

RUN set -xe \
  && OTP_DOWNLOAD_URL="https://github.com/erlang/otp/releases/download/OTP-${OTP_VERSION}/otp_src_${OTP_VERSION}.tar.gz" \
  && OTP_DOWNLOAD_SHA256="ce43dc8a29ad6bc1b6dbfc97f053d2e850b4a4c290eca065058d6b33ce476db5" \
  && apk add --no-cache --virtual .fetch-deps \
  curl \
  ca-certificates \
  && curl -fSL -o otp-src.tar.gz "$OTP_DOWNLOAD_URL" \
  && echo "$OTP_DOWNLOAD_SHA256  otp-src.tar.gz" | sha256sum -c - \
  && apk add --no-cache --virtual .build-deps \
  dpkg-dev dpkg \
  gcc \
  g++ \
  libc-dev \
  linux-headers \
  make \
  autoconf \
  ncurses-dev \
  openssl-dev \
  unixodbc-dev \
  lksctp-tools-dev \
  tar \
  && export ERL_TOP="/usr/src/otp_src_${OTP_VERSION%%@*}" \
  && mkdir -vp $ERL_TOP \
  && tar -xzf otp-src.tar.gz -C $ERL_TOP --strip-components=1 \
  && rm otp-src.tar.gz \
  && ( cd $ERL_TOP \
  && ./otp_build autoconf \
  && gnuArch="$(dpkg-architecture --query DEB_HOST_GNU_TYPE)" \
  && ./configure --build="$gnuArch" \
  && make -j$(getconf _NPROCESSORS_ONLN) \
  && make install ) \
  && rm -rf $ERL_TOP \
  && find /usr/local -regex '/usr/local/lib/erlang/\(lib/\|erts-\).*/\(man\|doc\|obj\|c_src\|emacs\|info\|examples\)' | xargs rm -rf \
  && find /usr/local -name src | xargs -r find | grep -v '\.hrl$' | xargs rm -v || true \
  && find /usr/local -name src | xargs -r find | xargs rmdir -vp || true \
  && scanelf --nobanner -E ET_EXEC -BF '%F' --recursive /usr/local | xargs -r strip --strip-all \
  && scanelf --nobanner -E ET_DYN -BF '%F' --recursive /usr/local | xargs -r strip --strip-unneeded \
  && runDeps="$( \
  scanelf --needed --nobanner --format '%n#p' --recursive /usr/local \
  | tr ',' '\n' \
  | sort -u \
  | grep -v 'libc\.so' \
  | awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
  )" \
  && REBAR3_DOWNLOAD_URL="https://github.com/erlang/rebar3/archive/${REBAR3_VERSION}.tar.gz" \
  && REBAR3_DOWNLOAD_SHA256="7d3f42dc0e126e18fb73e4366129f11dd37bad14d404f461e0a3129ce8903440" \
  && curl -fSL -o rebar3-src.tar.gz "$REBAR3_DOWNLOAD_URL" \
  && echo "${REBAR3_DOWNLOAD_SHA256}  rebar3-src.tar.gz" | sha256sum -c - \
  && mkdir -p /usr/src/rebar3-src \
  && tar -xzf rebar3-src.tar.gz -C /usr/src/rebar3-src --strip-components=1 \
  && rm rebar3-src.tar.gz \
  && cd /usr/src/rebar3-src \
  && HOME=$PWD ./bootstrap \
  && install -v ./rebar3 /usr/local/bin/ \
  && rm -rf /usr/src/rebar3-src \
  && apk add --virtual .erlang-rundeps \
  $runDeps \
  lksctp-tools \
  ca-certificates \
  && apk del .fetch-deps .build-deps

# Taken from https://github.com/erlef/docker-elixir/blob/70cad0543fc1781daa678c2a8c44bc87a1c38767/1.17/otp-26-alpine/Dockerfile
FROM erlang AS elixir

ARG ELIXIR_VERSION
ENV MIX_ENV=prod

# Install elixir
RUN set -xe \
  && ELIXIR_DOWNLOAD_URL="https://github.com/elixir-lang/elixir/archive/${ELIXIR_VERSION}.tar.gz" \
  && ELIXIR_DOWNLOAD_SHA256="8e136c0a92160cdad8daa74560e0e9c6810486bd232fbce1709d40fcc426b5e0" \
  && buildDeps=' \
  ca-certificates \
  curl \
  make \
  ' \
  && apk add --no-cache --virtual .build-deps $buildDeps \
  && curl -fSL -o elixir-src.tar.gz $ELIXIR_DOWNLOAD_URL \
  && echo "$ELIXIR_DOWNLOAD_SHA256  elixir-src.tar.gz" | sha256sum -c - \
  && mkdir -p /usr/local/src/elixir \
  && tar -xzC /usr/local/src/elixir --strip-components=1 -f elixir-src.tar.gz \
  && rm elixir-src.tar.gz \
  && cd /usr/local/src/elixir \
  && make install clean \
  && find /usr/local/src/elixir/ -type f -not -regex "/usr/local/src/elixir/lib/[^\/]*/lib.*" -exec rm -rf {} + \
  && find /usr/local/src/elixir/ -type d -depth -empty -delete \
  && apk del .build-deps

# The image to build the release
# We need the libraries installed in base for the NIF
# to compile correctly
FROM elixir AS builder

ARG SENTRY_DSN

# set build ENV
ENV MIX_ENV=prod
ENV ERL_AFLAGS="+JPperf true"
ENV SENTRY_DSN=$SENTRY_DSN

RUN mkdir -p /app
WORKDIR /app

# This step installs all the build tools we'll need
RUN set -xe && \
  apk update && \
  apk upgrade --no-cache && \
  apk add --no-cache --virtual .build-deps \
  git \
  rust cargo \
  build-base

# install hex + rebar
RUN mix local.hex --force && \
  mix local.rebar --force

# install mix dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix deps.get --only prod && \
  mix deps.compile

# build project
COPY priv priv
COPY lib lib

COPY rel rel

RUN mix compile

# Compress source code for sentry
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
  mix sentry.package_source_code || false

# build release
RUN mix release

RUN apk del .build-deps

# From this line onwards, this is the image we'll actually use
FROM base AS runner

LABEL org.opencontainers.image.title="Lotta Schule"
LABEL org.opencontainers.image.source="https://github.com/lotta-schule/lotta"
LABEL org.opencontainers.image.authors="Lotta Schule <kontakt@lotta.schule>"
LABEL org.opencontainers.image.url="https://lotta.schule"

EXPOSE 4000
EXPOSE 4321

RUN mkdir -p /app
WORKDIR /app
ENV HOME=/app
ENV VIX_COMPILATION_MODE=PLATFORM_PROVIDED_LIBVIPS

COPY --from=builder /app/_build/prod/rel/lotta ./
RUN chown -R nobody: /app
USER nobody

HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=5 \
  CMD netstat -ltn | grep -c 4321

CMD ["env", "sh", "-c", "/app/bin/migrate && /app/bin/server"]
