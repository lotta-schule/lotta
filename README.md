# Lotta Web Client

Web Client for Lotta Project

[![pipeline status](https://gitlab.com/medienportal/api-server/badges/master/pipeline.svg)](https://gitlab.com/medienportal/api-server/commits/master)
[![coverage report](https://gitlab.com/medienportal/api-server/badges/master/coverage.svg)](https://gitlab.com/medienportal/api-server/commits/master)

## What is Lotta

Lotta is a simple-to use platform aimed at schools.
Its comprehensible interface makes it easy for pupils and teachers
to create a sophisticated webpage for their school,
providing articles, files and media in access-controlled spaces.

See [https://lotta.schule](lotta.schule) for more information.

## What does this repository contain

This repository contains the source code for the lotta web client.

The lotta web client is the web frontend which connects to a lotta
api, mainly over graphql.

The latest tagged commit on master is deployed, as is.

We invite you to inspect the source code, but have not yet decided
about the terms we want to apply, so please contact us if you have
questions about licensing or contributing.

We will probably change this situation soon.

## Develop

The project is a [nextjs](https://nextjs.org/) project.

### Configuration

The configuration is done via environment variables.
You can find the local configuration in `.env.development`.

If you have an instance of the api running locally on port
4000 (default), the project should work without modification.

If you want to modify or add configuration, you can create an
`.env` file containing your custom configuration.

### Start the project

Start with `npm start`.

Test with `npm start`.

There is a storybook project for the component library (which is still
work in progress), start it with `npm run storybook`.

### Problems

Our issue tracker is not public yet. Please send a mail at dev[at]lotta.schule.
