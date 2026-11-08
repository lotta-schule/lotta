# Lotta End-to-End Tests

[Lotta](https://lotta.schule) End-to-End Test Suite powered by [Playwright](https://playwright.dev/).

These are the humble beginnings of a more complete test suite that will hopefully cover all the important parts of the
Lotta application and give us more confidence in our changes as well as reduce our manual testing efforts.

## Running the test suite

For the time being, our efforts are focused on building a solid test suite that can be run from the docker images
we build in our pipelines and use for production deployments.

The setup should run as-is, with dummy data, test users and credentials provided.
For different setups or environments, have a look at `scripts/test.sh` and adjust the environment variables accordingly.

```bash
# While in the root of the e2e directory, start the lotta docker images
docker compose up -d

# Alternativly, nother version than 'latest' can be used:
IMAGE_TAG=<someother> docker compose up -d

# Run the tests
./scripts/test.sh

# Test options can be passed to the script. For example to test with UI:
./scripts/test.sh --ui
```

## Writing tests

Lotta is multi-tenant: every tenant has its own database schema. The suite uses this for isolation:

- **One tenant per worker.** Use `tenantTest` from `fixtures.ts`. Each Playwright worker gets a fresh,
  ready-to-use tenant (created through the core admin API, deleted afterwards), so tests can run fully in parallel.
  Tests of the same worker share that tenant, so don't rely on state other tests may change (e.g. the tenant's title).
- **Users per role.** Every tenant has `users.admin`, `users.teacher` and `users.student`.
  `test.use({ loginAs: 'teacher' })` starts each test already logged in (the login happens once per worker, via API).
  Tests that change a user (password, email, …) create their own with `seed({ users: [...] })`.
- **Seed data through APIs, not the UI.** `seed()` creates users and groups (core `/admin/api/seed`, enabled by
  `ENABLE_E2E_API`). `graphqlAs('admin')` together with `helper/content.ts` creates categories and articles.
  Only use the UI for the part a test is actually about.
- **Tags.** Tests tagged `@smoke` cover the most important journeys: `bun run e2e:smoke`.

## Load testing

`load/smoke.js` is a [k6](https://grafana.com/docs/k6/latest/) load test. Every virtual user loads the home, a
category and an article page and sends the GraphQL queries those pages send. The script finds a category and an
article itself, so any tenant with some content works.

```bash
# Against the docker compose setup above (after creating the tenant, see scripts/lh_tenant/setup.ts)
k6 run load/smoke.js

# Against any deployment, with more load
BASE_URL=https://test.lotta.schule VUS=20 DURATION=2m k6 run load/smoke.js
```

It prints median / p95 / p99 latency per request and writes the same as Markdown to `load/load-test-report.md`.
The p95 limits per request are in `REQUESTS` in `load/smoke.js`.

In CI, the `Load test` workflow runs it against every image CD builds and posts the result as a PR comment. The
thresholds don't fail the pipeline, because shared runners are too noisy for that. Only compare runs on the same kind
of machine. The workflow can also be started by hand against any URL (e.g. staging).
