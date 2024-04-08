# Lotta

Lotta is a simple-to use platform aimed at schools.
Its comprehensible interface makes it easy for students and teachers
to create a sophisticated webpage for their school,
providing articles, files and media in access-controlled spaces.

See [https://lotta.schule](lotta.schule) for more information.

The latest git tag is the currently deployed version that also runs
unmodified on our infrastructure.

## Development

For monorepo managing, we use [nx](https://nx.dev/).

### Prerequisites

- Have nodejs installed (See [.tool-versions](.tool-versions)) to see which one
- This is a monorepo taking advantage of [pnpm workspaces](https://pnpm.io/workspaces).
  You will have to have [pnpm installed](https://pnpm.io/installation) on your machine.
- Have a working [core instance](https://github.com/lotta-schule/core) running.

### Commands

1. Install the necessary dependencies. In the project's root folder, run:

```sh
pnpm install
```

2. Run all available tests (this will take a few minutes, depending on the machine you run it on):

```sh
pnpm test -- --no-watch
```

3. Run all available linters / typecheckers:

```sh
pnpm lint
pnpm typecheck
```

4. Start the Development environment:

```sh
pnpm dev
```

This will start:

- The _Hubert Storybook_ on [localhost:6006](http://localhost:6006).
  This project lists, shows and documents any components we have available
  in our component library _Hubert_.
- The _Lotta Webapp_. The main web frontend to a lotta project.
  This is what is usually referred to by _lotta_.
  By default, it'll start on [localhost:3000](http://localhost:3000) on
  your machine.

The easiest is to start by creating a new lotta tenant, or copying over
the data from some prod or test system. As lotta recognizes its tenants
via the host url, we suggest you use `http://<tenant-slug>.local.lotta.schule:3000`;
It's pointed directly to your localhost, but with the extra of having
a multitenant-capable hostname
