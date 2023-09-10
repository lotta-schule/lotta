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
- Have a working [core instance](https://github.com/lotta-schule/core) running.

### Commands

1. Run all available tests:

``` sh
npm test
```


2. Run all available linters / typecheckers:

``` sh
npm run lint
npm run typecheck
```

3. Start the Development environment:


``` sh
npm run dev
```

This will start:
- The *Hubert Storybook* on [localhost:6006](http://localhost:6006).
  This project lists, shows and documents any components we have available
  in our component library *Hubert*.
- The *Lotta Webapp*. The main web frontend to a lotta project.
  This is what is usually referred to by *lotta*.


The easiest is to start by creating a new lotta tenant, or copying over
the data from some prod or test system. As lotta recognizes its tenants
via the host url, we suggest you use <tenant-slug>.local.lotta.schule;
It's pointed directly to your localhost, but with the extra of having
a multitenant-capable hostname
