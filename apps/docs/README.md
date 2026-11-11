# Lotta Dokumentation (`apps/docs`)

User documentation for Lotta, served at https://docs.lotta.schule.
Built with [Astro Starlight](https://starlight.astro.build), edited either as files or
visually with [Keystatic](https://keystatic.com) at `/keystatic`.

```bash
bunx nx run docs:dev     # http://localhost:4321, editor at /keystatic (edits files on disk)
bunx nx run docs:build   # also validates all internal links
```

## Content

- Pages: `src/content/docs/**/*.mdx` (German). Each folder is a sidebar section (`astro.config.mjs`):

  | Folder                     | Section                  | For                                                           |
  | -------------------------- | ------------------------ | ------------------------------------------------------------- |
  | `erste-schritte/`          | Erste Schritte           | everyone new: overview, sign-in, setting up a school          |
  | `nutzen/`                  | Lotta nutzen             | all members                                                   |
  | `beitraege/` (+ `module/`) | Beiträge schreiben       | everyone writing articles                                     |
  | `verwalten/`               | Lotta verwalten (Admins) | admins                                                        |
  | `hilfe/`                   | Hilfe                    | FAQ, glossary, contact                                        |
  | `neuigkeiten/`             | Neuigkeiten              | school-facing release notes, one page per minor/major release |

  Pages are ordered within their section by `sidebar.order` in the frontmatter
  ("Reihenfolge in der Navigation" in Keystatic); use steps of 10. Exception: "Beiträge
  schreiben" lists its pages explicitly (to show the modules as a group), so add new pages
  directly in `beitraege/` to the sidebar in `astro.config.mjs`.

- Components available in every page without imports (auto-imported, and editable in Keystatic):
  `<Aside>`, `<Steps>`, `<Tabs>`/`<TabItem>`, `<CardGrid>`, `<Card>`, `<LinkCard>`,
  `<Screenshot name alt caption?>`, `<Video name title>`.
  Do not add `import` statements, raw HTML or frontmatter keys other than `title`,
  `description` and `sidebar.order` to pages: Keystatic would drop them.
- `src/assets/screenshots/`, `src/assets/videos/`: **generated** by the `docs` Playwright project in
  `apps/e2e` (`apps/e2e/docs/*.docs.ts`). Do not edit by hand. `<Screenshot name="x">` shows a
  placeholder until `x.png` exists. Exceptions: `videos/overview.webm` and `videos/module-table.webm`
  are recordings taken over from the old GitBook docs.
- Old URLs: `redirects.mjs` maps every page of the old GitBook docs (`docs.lotta.schule/lotta/…`)
  and earlier pages of this site to their new page. Add an entry when you move or rename a page.
- `src/assets/uploads/`: images uploaded manually through the editor.
- Changelog: [starlight-changelogs](https://github.com/HiDeoo/starlight-changelogs) renders the root `CHANGELOG.md`
  (written by `nx release changelog` in the release pull request) at `/changelog/`, one page per version
  (`changelogs` collection in `src/content.config.ts`).

## Writing guide

- Address readers with **"Sie"**. Refer to people neutrally where possible ("Mitglieder",
  "Lehrkräfte", "Admins", "Besuchende"), otherwise in pairs ("Schülerinnen und Schüler").
- Start each page with one or two sentences on what it is about, then task-oriented sections.
  Procedures go into `<Steps>`, hints and warnings into `<Aside>`. End with "Siehe auch" links
  where useful.
- Name UI elements by their **visible label in bold**, exactly as in the app ("Klicken Sie auf
  **speichern**"), so the text works without screenshots. Screenshots illustrate; they never
  carry information the text does not. No meaning by colour alone, no emoji step numbers.
- Put synonyms people might search for into `description` (e.g. "Widget" for Marginale):
  the search (Pagefind) indexes it.
- Link with site-relative paths (`/nutzen/profil/`), never absolute docs URLs.
- No real school data (names, enrollment keys, documents) in text or screenshots.
- Terms (see also `hilfe/glossar.mdx`):

  | Use                                                     | Not                                                            |
  | ------------------------------------------------------- | -------------------------------------------------------------- |
  | Lotta-Seite                                             | Lotta (for the instance), Homepage, HP                         |
  | Mitglied / Besuchende                                   | User, Benutzer (except in UI labels)                           |
  | Admin                                                   | Administrator                                                  |
  | Beitrag                                                 | Artikel                                                        |
  | Kategorie, Hauptkategorie, Unterkategorie, Seitenleiste | Menüpunkt, Subnavigation, Randnavigation (except in UI labels) |
  | Marginale, pl. Marginalen                               | Widget (only as synonym)                                       |
  | Einschreibeschlüssel                                    | Anmeldeschlüssel, Passwort für Gruppen (except in UI labels)   |
  | Badge                                                   | Batch-Icon                                                     |
  | Entwurf / Zur Freigabe / Veröffentlicht                 | in Bearbeitung, Bereit zur Freigabe (except in UI labels)      |

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
