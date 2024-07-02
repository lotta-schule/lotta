# Lotta

Lotta is a simple-to use platform aimed at schools.
Its comprehensible interface makes it easy for students and teachers
to create a sophisticated webpage for their school,
providing articles, files, messages and media in access-controlled spaces.

See [https://lotta.schule](lotta.schule) for more information.

The latest git tag is the currently deployed version that also runs
unmodified on our infrastructure.

## Components

### Webapp

Location: apps/webapp

The Webapp is a [NextJS](https://nextjs.org/) app that serves the application.
Its primary purpose is serving the frontend.

### Core

Location: apps/core

The Core is a [Phoenix](https://www.phoenixframework.org/) app that serves the backend,
handles authentication and authorization, data storage and retrieval, real-time notifications,
and more.
The boundary to the outside wolrd consists primarily of a [GraphQL](https://graphql.org/) API.

### Hubert

Location: libs/hubert

[Hubert](https://www.npmjs.com/package/@lotta-schule/hubert) is our component library.
See our [storybook](https://lotta-schule.github.io/web) to get an overview over the
available components.

### Theme

Location: libs/theme

Here lies the definition and schema lotta uses for theming.

### Storybook Hubert

Location: apps/storybook-hubert

The storybook project for hubert. It's just for illustration purposes and drives the
[storybook](https://lotta-schule.github.io/web) for hubert.

### Storybook-Addon-Theme

Location: libs/storybook-addon-theme

A storybook-addon which allows editing the lotta theme in storybook

## Development

For monorepo managing, we use [nx](https://nx.dev/).

### Prerequisites

- Have nodejs installed (See [.tool-versions](.tool-versions)) to see which one
- Have elixir installed (See [.tool-versions](.tool-versions)) to see which one.
  Take care to have the same version of [OTP](https://en.wikipedia.org/wiki/Open_Telecom_Platform) installed as well.
- This is a monorepo taking advantage of [pnpm workspaces](https://pnpm.io/workspaces).
  You will have to have [pnpm installed](https://pnpm.io/installation) on your machine.
- Either have a local postgres database, redis cache, and a RabbitMQ broker running,
  or just have a docker daemon running.
  The services you'll need are defined in `apps/core-api/docker-compose.services.yml`.

We know getting started is not very easy at this point, but it has not been a priority yet.
If you are interested in contributing, or have any questions, feel free to reach out to us.

### Commands

1. Install the necessary dependencies. In the project's root folder, run:

```sh
pnpm install
```

2. Make sure you have the necessary services running. If you have docker installed, you can start them with:

```sh
docker-compose -f apps/core-api/docker-compose.services.yml up -d
```

3. Run all available tests (this will take a few minutes, depending on the machine you run it on):

```sh
pnpm test
```

4. Run all available linters / typecheckers:

```sh
pnpm lint
pnpm typecheck
```

5. Start the Development environment:

```sh
pnpm dev
```

This will start:

- The _Hubert Storybook_ on [localhost:6006](http://localhost:6006).
  This project lists, shows and documents any components we have available
  in our component library _Hubert_.
- The _Lotta Core API_. The main backend to a lotta project.
  By default, it'll start on [localhost:4000](http://localhost:4000) on
  your machine.
- The _Lotta Webapp_. The main web frontend to a lotta project.
  This is what is usually referred to by _lotta_.
  By default, it'll start on [localhost:3000](http://localhost:3000) on
  your machine.

The easiest is to start by creating a new lotta tenant, or copying over
the data from some prod or test system. As lotta recognizes its tenants
via the host url, we suggest you use `http://<tenant-slug>.local.lotta.schule:3000`;
It's pointed directly to your localhost, but with the extra of having
a multitenant-capable hostname
