# Lotta Dokumentation (`apps/docs`)

User documentation for Lotta, served at https://docs.lotta.schule.
Built with [Astro Starlight](https://starlight.astro.build), edited either as files or
visually with [Keystatic](https://keystatic.com) at `/keystatic`.

```bash
bunx nx run docs:dev     # http://localhost:4321, editor at /keystatic (edits files on disk)
bunx nx run docs:build   # also validates all internal links
```

## Content

- Pages: `src/content/docs/**/*.mdx` (German). Folders map to sidebar groups in `astro.config.mjs`.
- Components available in every page without imports (auto-imported, and editable in Keystatic):
  `<Aside>`, `<Steps>`, `<Tabs>`/`<TabItem>`, `<Screenshot name alt caption?>`, `<Video name title>`.
  Do not add `import` statements to pages: Keystatic would drop them.
- `src/assets/screenshots/`, `src/assets/videos/`: **generated** by the `docs` Playwright project in
  `apps/e2e`. Do not edit by hand. `<Screenshot name="x">` shows a placeholder until `x.png` exists.
- `src/assets/uploads/`: images uploaded manually through the editor.
- Changelog: `src/pages/changelog.astro` renders the root `CHANGELOG.md` (written by `nx release changelog`).

## Visual editor (Keystatic)

In production, editors log in with GitHub; every save goes to a `docs/*` branch, and the editor
offers to open a pull request against `main`. Editors need write access to the repository
(a dedicated team); `main` stays protected, so changes only land through reviewed PRs.

One-time setup:

1. Run the docs locally in production mode with the GitHub storage and open `/keystatic`;
   Keystatic's wizard creates the GitHub App and prints the values below.
   Set the App's callback URL to `https://docs.lotta.schule/api/keystatic/github/oauth/callback`.
2. Runtime env for the `docs` container: `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (≥ 32 chars).
3. Build arg `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (the App's public slug).

## Deployment

`apps/docs/Dockerfile` builds a Node server (prerendered pages + editor routes) on port 4321.
It is published as `ghcr.io/lotta-schule/docs` by `.github/workflows/cd.yaml`, like `web` and `core`.
