# Bundle size report

Measures the first-load JS (gzip) of every route from the `next build` output and compares it with `main`.

```bash
# in apps/webapp, after `bun run build`
bun scripts/bundle-size/cli.ts collect --out bundle-stats.json
bun scripts/bundle-size/cli.ts report --head bundle-stats.json [--base main-stats.json]
```

**First load** of a route = the chunks every route loads ("shared") plus the client chunks of the route's layouts,
error boundaries and page, from `.next/server/app/**/page_client-reference-manifest.js`. Chunks loaded later
(`next/dynamic`, `import()`) are not part of it, which is exactly what lazy loading should reduce.

CI: `.github/workflows/bundle-size.yaml` stores the stats of every `main` build as an artifact and posts the comparison
as a sticky comment on pull requests that touch the webapp. Changes below 500 B are only listed in the collapsed full
table.
