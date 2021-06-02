# Lotta Web Client

Web Client for Lotta Project

[![pipeline status](https://gitlab.com/medienportal/api-server/badges/master/pipeline.svg)](https://gitlab.com/medienportal/api-server/commits/master)
[![coverage report](https://gitlab.com/medienportal/api-server/badges/master/coverage.svg)](https://gitlab.com/medienportal/api-server/commits/master)

## What is Lotta

Lotta is a simple-to use platform aimed at schools.
Its comprehensible interface makes it easy for pupils and teachers
to create a sophisticated webpage for their school,
providing articles, files and media in access-controlled spaces.

## Develop

### Using docker

Make sure you have [docker](https://www.docker.com/products/docker-desktop) installed,
than copy over the .env.sample to .env and start with:

You will need an [API server](https://gitlab.com/medienportal/api-server) up
and running in order to start.

You may have to run `docker-compose run web npm install` to update your dependencies.

- Start the development server and storyboard together

``` bash
docker-compose up
```

### Without docker

If you do not want to use docker, for example for performance reasons,
you will have to have [nodejs](https://nodejs.org) installed.

You may have to run `npm install` to update your dependencies.

- Start the development server

``` bash
npm start
```

- Start the development Storyboard

``` bash
npm run storybook
```

### Possible Errors

#### Error: Cannot find module (...)

You are missing some dependencies. You probably need to run

``` bash
docker-compose run web npm install
```

#### Failing tests on Gitlab CI

If tests are failing on Gitlab CI:

- find out the test which is failing and try to figure out what is happening.
A test for a component is found in the same file, but with the ending `.test.tsx?`.

You can execute the tests locally with the command:

``` bash
docker-compose run web npm test
```
