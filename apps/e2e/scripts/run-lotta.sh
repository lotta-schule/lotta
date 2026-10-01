#!/bin/bash

if [[ $* == *--local* ]]; then

  if [[ $* == *--build* ]]; then
    echo "Building docker images"
    bash -c "cd ../core-api && docker build -t lotta-core ." &
    bash -c "cd ../.. && docker build -t lotta-web -f ./apps/webapp/Dockerfile ." &

    export LOTTA_WEB_IMAGE=lotta-web
    export LOTTA_CORE_IMAGE=lotta-core

    wait
  fi

  echo "Using local images"
  export LOTTA_WEB_IMAGE=lotta-web
  export LOTTA_CORE_IMAGE=lotta-core
fi

docker compose up
