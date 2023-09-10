# Lotta Web Client

Web Client for Lotta Project

[![codecov](https://codecov.io/gh/lotta-schule/web/branch/main/graph/badge.svg?token=FAT99O6QKV)](https://codecov.io/gh/lotta-schule/web)

## What's the webapp?

This package contains the source code for the lotta web client,
that is the entire nextjs web frontend that serves the user the
server-prerendered react application, as well our component library
[Hubert](packages/hubert/readme.md) which was specially tought for our needs.

The lotta web client does not treat any data, but acts as merely
more than a proxy, prerendering the ui and sending over requests
to the [lotta core API Server](https://github.com/lotta-schule/core).

We invite you to inspect the source code, and maybe even participate.
We are aware that the current state of the repo is not particularly
accessible, but we are happy to answer questions should they come up.

Just open an issue.

## Develop

The project is a [nextjs](https://nextjs.org/) project.

### Installation

- Make sure you have a running instance of the [lotta Core API Server](https://github.com/lotta-schule/core).
- You will need an up-to-date version of nodejs installed.
  See `.tools-version` file to maximize compatibility

### Configuration

The configuration is done via environment variables.
You can find the local configuration in `.env.development`.

If you have an instance of the api running locally on port
4000 (default), the project should work without modification.

If you want to modify or add configuration, you can create an
`.env` file containing your custom configuration.

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
<td>FORCE_BASE_URL</td>
<td>Base URL for fetching ugc from a different Lotta Core Instance. This can be useful because during development, the local url for images is passed to the cloudimg service, but - as local url - cannot be resolved, so no images are displayed. By providing an alternative (publicly available) endpoint just for images, you can ensure the images can be displayed.</td>
</tr>
<tr>
<td>FORCE_TENANT_SLUG</td>
<td>Force a tenant slug. By default the slug is recognized via the URL. This can be useful when using http://localhost, for example.</td>
</tr>
<tr>
<td>BROWSERLESS_CHROME_ENDPONT</td>
<td>
For PDF generation, you will need a [browserless](https://browserless.io/) instance.
You can either use the public instance by using the value `https://chrome.browserless.io` or you
can provide an own instance at a given URL.
If not provided, PDF generation will not be available.
using this option.
</td>
</tr>
</tbody>
</table>

