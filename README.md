# Lotta Web Client

Web Client for Lotta Project

[![pipeline status](https://gitlab.com/lotta-schule/api-server/badges/master/pipeline.svg)](https://gitlab.com/medienportal/api-server/commits/master)
[![coverage report](https://gitlab.com/lotta-schule/api-server/badges/master/coverage.svg)](https://gitlab.com/medienportal/api-server/commits/master)

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

<<<<<<< HEAD
These are the available options:

<table>
<thead>
<tr>
<td>environment variable</td>
<td>desciption</td>
</tr>
</thead>

<tbody>
<tr>
<td>API_SOCKET_URL</td>
<td>Endpoint for the socket connetion</td>
</tr>
<tr>
<td>API_URL</td>
<td>Endpoint for the API.</td>
</tr>
<tr>
<td>APP_ENVIRONMENT</td>
<td>Name of the environment</td>
</tr>
<tr>
<td>CLOUDIMG_TOKEN</td>
<td>API Token for the cloudimg CDN</td>
</tr>
<tr>
<td>FORCE_BASE_URL</td>
<td>Base URL for fetching ugc from a different API. This can be useful because during development, the local url for images is passed to the cloudimg service, but - as local url - cannot be resolved, so no images are displayed. By providing an alternative (publicly available) endpoint just for images, you can ensure the images can be displayed.</td>
</tr>
<tr>
<td>FORCE_TENANT_SLUG</td>
<td>Force a tenant slug. By default the slug is recognized via the URL. This can be useful when using http://localhost, for example.</td>
</tr>
</tbody>
</table>

### Start the project

Start with `npm start`.

Test with `npm test`.

There is a storybook project for the component library (which is still
work in progress), start it with `npm run storybook`.
