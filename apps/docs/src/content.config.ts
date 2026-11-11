import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { changelogsLoader } from 'starlight-changelogs/loader';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // The repository's CHANGELOG.md, written by `nx release changelog` (scripts/release.sh)
  // when a release pull request is created. Rendered at /changelog/, one page per version.
  changelogs: defineCollection({
    loader: changelogsLoader([
      {
        provider: 'conventional-changelog',
        base: 'changelog',
        changelog: '../../CHANGELOG.md',
        title: 'Änderungen',
      },
    ]),
  }),
};
