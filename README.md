# Lotta Web Client

Web Client for Lotta Project

## What is Lotta

Lotta is a simple-to use platform aimed at schools.
Its comprehensible interface makes it easy for pupils and teachers to create a sophisticated webpage for their school, providing articles, files and media in access-controlled spaces.

## Develop

Make sure you have [docker](https://www.docker.com/products/docker-desktop) installed, than copy over the .env.sample to .env and start with:
```bash
docker-compose run app npm install
docker-compose up
```

You will need an [API server](https://gitlab.com/medienportal/api-server) up and running in order to start.

[![pipeline status](https://gitlab.com/medienportal/api-server/badges/master/pipeline.svg)](https://gitlab.com/medienportal/api-server/commits/master)
[![coverage report](https://gitlab.com/medienportal/api-server/badges/master/coverage.svg)](https://gitlab.com/medienportal/api-server/commits/master)
