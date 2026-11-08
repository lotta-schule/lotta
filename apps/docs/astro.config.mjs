// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import keystatic from '@keystatic/astro';
import AutoImport from 'astro-auto-import';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  site: process.env.DOCS_SITE_URL ?? 'https://docs.lotta.schule',
  // Pages are prerendered; only the Keystatic editor routes run on demand.
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  vite: {
    // Starlight's <Steps>/<Tabs> use satteri (native binding) at render time.
    // Bundling it breaks the platform-specific binding lookup, so keep it external
    // (it is a direct dependency of this package for that reason).
    ssr: { external: ['satteri'] },
  },
  redirects: {
    // Old GitBook paths (docs.lotta.schule/lotta/...)
    '/lotta': '/',
    '/lotta/[...slug]': '/[...slug]',
  },
  integrations: [
    // Components usable in every .mdx page without an import statement,
    // so pages stay editable in Keystatic (which does not keep ESM imports).
    AutoImport({
      imports: [
        {
          '@astrojs/starlight/components': ['Aside', 'Steps', 'Tabs', 'TabItem'],
        },
        fileURLToPath(new URL('./src/components/Screenshot.astro', import.meta.url)),
        fileURLToPath(new URL('./src/components/Video.astro', import.meta.url)),
      ],
    }),
    starlight({
      title: 'Lotta Dokumentation',
      description: 'Anleitungen und Hilfe für Lotta, die Plattform für Schulen.',
      defaultLocale: 'root',
      locales: { root: { label: 'Deutsch', lang: 'de' } },
      logo: { src: './src/assets/logo.png' },
      favicon: '/favicon.ico',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/lotta-schule/lotta' },
      ],
      lastUpdated: true,
      components: {
        EditLink: './src/components/EditLink.astro',
      },
      sidebar: [
        { label: 'Anleitung', items: [{ autogenerate: { directory: 'anleitung' } }] },
        { label: 'Administration', items: [{ autogenerate: { directory: 'administration' } }] },
        { label: 'Änderungen', link: '/changelog/' },
      ],
      plugins: [starlightLinksValidator({ errorOnLocalLinks: false })],
    }),
    // Listed explicitly (after AutoImport) so astro-auto-import can hook into it;
    // Starlight would otherwise add it too late.
    mdx(),
    react(),
    keystatic(),
  ],
});
