# Lotta

[Lotta](https://lotta.schule) API Server

Phoenix, Elixir & Absinthe

## Setup

Make sure to have [elixir](https://elixir-lang.org/install.html) installed.

The project depends on:

- postgres
- redis
- elasticsearch
- An S3-compatible Object storage

In order to faciliate the setup during development, a docker-compose file
for these services is provided.
If you want to use it, [install docker](https://docs.docker.com/engine/install/)
and then start the services:

``` bash
docker-compose -f docker-compose.services.yml up -d
```

You will then be able to start phoenix using:

``` bash
mix phx.server
```
