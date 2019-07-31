FROM node:12-alpine AS build

# build tools
RUN apk add --update --no-cache \
    python \
    make \
    g++

ENV CI=true

ENV REACT_APP_APP_BASE_DOMAIN ".lotta.schule"
ENV REACT_APP_API_URL "https://api.lotta.schule/api"
ENV REACT_APP_AUTHENTICATION_TOKEN_NAME "LottaToken"
ENV REACT_APP_CLOUDIMG_TOKEN "afdptjdxen"
ENV REACT_APP_SENTRY_URL "https://8288b744e87844eab5a952bf5ed42fb1@sentry.io/1517545"
ENV REACT_APP_MATOMO_URL "https://analytics.einsa.net"
ENV REACT_APP_MATOMO_SITEID "6"

ADD . /src
WORKDIR /src
RUN npm install
RUN npm run lint
# RUN npm run test -- --no-watch
RUN npm run build
RUN npm prune --production

# Dockerfile continued

FROM nginx

# install curl for healthcheck
# RUN apk add --update --no-cache curl

ENV DIR=/usr/src/service
WORKDIR $DIR

# Copy files from build stage
COPY --from=build /src/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# HEALTHCHECK --interval=5s \
#     --timeout=5s \
#     --retries=6 \
#     CMD curl -fs http://localhost:80/_health || exit 1