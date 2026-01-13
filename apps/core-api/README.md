# Lotta

[Lotta](https://lotta.schule) API Server

Phoenix, Elixir & Absinthe

## Setup

Make sure to have [elixir](https://elixir-lang.org/install.html) installed.

The project depends on:

- postgres
- redis
- An S3-compatible Object storage

In order to faciliate the setup during development, a docker-compose file
for these services is provided.
If you want to use it, [install docker](https://docs.docker.com/engine/install/)
and then start the services:

```bash
docker-compose -f docker-compose.services.yml up -d
```

You will then be able to start phoenix using:

```bash
mix phx.server
```

### Create an instance

To setup a site (a "tenant"), the easiest way is to startup the server
with an open console:

```bash
iex -S mix phx.server
```

The [IEX Console](https://hexdocs.pm/iex/1.13/IEx.html) opens. Type:

```elixir
Tenants.create_tenant(
  %Lotta.Tenants.Tenant{slug: "<chose-a-slug>", title: "<tenant-title>"},
  %Lotta.Accounts.User{email: "<your-email>", name: "<your-name>"}
)
```

When you then start the [Web Frontend](https://github.com/lotta-schule/web)
correctly configured to your started api endpoint, your app will be accible
on `http://<your-chosen-slug>.lotta.lvh.me:3000`.
