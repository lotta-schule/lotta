import { collection, config, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

/**
 * Visual editor at /keystatic.
 * - dev: edits the files on disk directly
 * - production: logs in with GitHub, every save goes to a `docs/*` branch, from which a PR is opened
 *
 * Only the components listed below can be used in pages. They are auto-imported
 * in astro.config.mjs, so pages never contain import statements.
 */
export default config({
  storage: import.meta.env.PROD
    ? {
        kind: 'github',
        repo: { owner: 'lotta-schule', name: 'lotta' },
        branchPrefix: 'docs/',
        pathPrefix: 'apps/docs',
      }
    : { kind: 'local' },
  ui: {
    brand: { name: 'Lotta Dokumentation' },
  },
  collections: {
    docs: collection({
      label: 'Seiten',
      path: 'src/content/docs/**',
      slugField: 'title',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: { label: 'Titel' },
          slug: {
            label: 'Pfad',
            description: 'z.B. anleitung/artikel-schreiben',
          },
        }),
        description: fields.text({
          label: 'Kurzbeschreibung',
          description: 'Erscheint in Suchergebnissen und Vorschauen.',
          multiline: true,
        }),
        sidebar: fields.object(
          {
            order: fields.integer({
              label: 'Reihenfolge in der Navigation',
              description:
                'Kleinere Zahlen stehen weiter oben in ihrem Abschnitt (z.B. 10, 20, 30).',
              defaultValue: 100,
              validation: { isRequired: true },
            }),
          },
          { label: 'Navigation' }
        ),
        content: fields.mdx({
          label: 'Inhalt',
          options: {
            image: {
              directory: 'src/assets/uploads',
              publicPath: '/src/assets/uploads/',
            },
          },
          components: {
            Aside: wrapper({
              label: 'Hinweis-Box',
              schema: {
                type: fields.select({
                  label: 'Art',
                  options: [
                    { label: 'Hinweis', value: 'note' },
                    { label: 'Tipp', value: 'tip' },
                    { label: 'Achtung', value: 'caution' },
                    { label: 'Gefahr', value: 'danger' },
                  ],
                  defaultValue: 'note',
                }),
                title: fields.text({ label: 'Überschrift (optional)' }),
              },
            }),
            Steps: wrapper({
              label: 'Schritt-für-Schritt',
              description: 'Enthält eine nummerierte Liste.',
              schema: {},
            }),
            CardGrid: wrapper({
              label: 'Kachel-Raster',
              description:
                'Ordnet Kacheln (Link-Kacheln, Kacheln) nebeneinander an.',
              schema: {},
            }),
            Card: wrapper({
              label: 'Kachel',
              schema: {
                title: fields.text({
                  label: 'Titel',
                  validation: { isRequired: true },
                }),
                icon: fields.text({
                  label: 'Symbol (optional)',
                  description:
                    'Name eines Starlight-Symbols, z.B. rocket, pencil, setting, information',
                }),
              },
            }),
            LinkCard: block({
              label: 'Link-Kachel',
              description:
                'Eine hervorgehobene Verlinkung auf eine andere Seite.',
              schema: {
                title: fields.text({
                  label: 'Titel',
                  validation: { isRequired: true },
                }),
                href: fields.text({
                  label: 'Ziel',
                  description: 'z.B. /nutzen/profil/',
                  validation: { isRequired: true },
                }),
                description: fields.text({ label: 'Beschreibung (optional)' }),
              },
            }),
            Screenshot: block({
              label: 'Screenshot (automatisch)',
              description:
                'Ein automatisch erzeugter Screenshot aus src/assets/screenshots/.',
              schema: {
                name: fields.text({
                  label: 'Name',
                  description: 'Dateiname ohne .png, z.B. article-edit',
                  validation: { isRequired: true },
                }),
                alt: fields.text({
                  label: 'Bildbeschreibung',
                  validation: { isRequired: true },
                }),
                caption: fields.text({ label: 'Bildunterschrift (optional)' }),
              },
            }),
            Video: block({
              label: 'Video (automatisch)',
              description:
                'Eine automatisch erzeugte Bildschirmaufnahme aus src/assets/videos/.',
              schema: {
                name: fields.text({
                  label: 'Name',
                  description: 'Dateiname ohne .webm',
                  validation: { isRequired: true },
                }),
                title: fields.text({
                  label: 'Titel',
                  validation: { isRequired: true },
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
