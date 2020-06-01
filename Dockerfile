FROM node:12-alpine AS build

# build tools
RUN apk add --update --no-cache \
    python \
    make \
    g++

ARG APP_ENVIRONMENT
ARG APP_REVISION
ARG APP_BASE_DOMAIN
ARG API_URL
ARG CLOUDIMG_TOKEN
ARG HONEYBADGER_API_KEY
ARG FILE_REPLACEMENT_URL

ENV CI=true
ENV REACT_APP_APP_ENVIRONMENT ${APP_ENVIRONMENT}
ENV REACT_APP_APP_REVISION ${APP_REVISION}
ENV REACT_APP_APP_BASE_DOMAIN ${APP_BASE_DOMAIN}
ENV REACT_APP_API_URL ${API_URL}
ENV REACT_APP_CLOUDIMG_TOKEN ${CLOUDIMG_TOKEN}
ENV REACT_APP_HONEYBADGER_API_KEY ${HONEYBADGER_API_KEY}
ENV REACT_APP_FILE_REPLACEMENT_URL ${FILE_REPLACEMENT_URL}

ADD . /src
WORKDIR /src
RUN npm install
RUN NODE_ENV=production npm run build
RUN npm prune --production


# Dockerfile continued
FROM nginx

WORKDIR /usr/src/service

# Copy files from build stage
COPY --from=build /src/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
