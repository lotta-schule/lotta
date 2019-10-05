FROM node:12-alpine AS build

# build tools
RUN apk add --update --no-cache \
    python \
    make \
    g++

ARG APP_BASE_DOMAIN
ARG API_URL
ARG AUTHENTICATION_TOKEN_NAME
ARG CLOUDIMG_TOKEN
ARG SENTRY_URL
ARG MATOMO_URL
ARG MATOMO_SITEID

ENV CI=true
ENV REACT_APP_APP_BASE_DOMAIN ${APP_BASE_DOMAIN}
ENV REACT_APP_API_URL ${API_URL}
ENV REACT_APP_AUTHENTICATION_TOKEN_NAME ${AUTHENTICATION_TOKEN_NAME}
ENV REACT_APP_CLOUDIMG_TOKEN ${CLOUDIMG_TOKEN}
ENV REACT_APP_SENTRY_URL ${SENTRY_URL}
ENV REACT_APP_MATOMO_URL ${MATOMO_URL}
ENV REACT_APP_MATOMO_SITEID ${MATOMO_SITEID}

ADD . /src
WORKDIR /src
RUN npm install
# RUN npm run test -- --no-watch
RUN NODE_ENV=production npm run build
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