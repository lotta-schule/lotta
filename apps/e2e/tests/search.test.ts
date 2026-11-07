import { Page } from '@playwright/test';
import { expect, Role, tenantTest as test } from '../fixtures';
import { createArticle, createCategory } from '../helper';

const search = async (page: Page, baseURL: string, term: string) => {
  await page.goto(baseURL + '/search');
  await page.getByRole('searchbox', { name: 'Suchbegriff' }).fill(term);
  // the search is debounced: wait for the result count
  // full-text search is the slowest query of the suite: allow more time under load
  await expect(page.getByText(/Es wurden \d+ Beiträge gefunden/)).toBeVisible({
    timeout: 20_000,
  });
};

test.describe('Search', () => {
  test(
    'finds published articles, and only those the user may read',
    { tag: '@smoke' },
    async ({ baseURL, graphqlAs, openPageAs, seed }) => {
      // one unique word, so the search only matches the articles of this test
      const word = `Zauberwort${Date.now().toString(36)}`;
      const {
        groups: [teachers],
      } = await seed({ groups: [{ name: 'Lehrer' }] });

      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, { title: `Suche ${word}` });
      const publicArticle = await createArticle(gql, {
        title: `Öffentlich ${word}`,
        categoryId: category.id,
      });
      const teachersArticle = await createArticle(gql, {
        title: `Lehrer ${word}`,
        categoryId: category.id,
        groupIds: [teachers.id],
      });
      const draft = await createArticle(gql, {
        title: `Entwurf ${word}`,
        categoryId: category.id,
        published: false,
      });

      const expectations: [Role, string[]][] = [
        ['guest', [publicArticle.title]],
        ['student', [publicArticle.title]],
        ['teacher', [publicArticle.title, teachersArticle.title]],
      ];

      for (const [role, visibleTitles] of expectations) {
        await test.step(`${role} finds ${visibleTitles.length} article(s)`, async () => {
          const page = await openPageAs(role);
          await search(page, baseURL, word);

          const results = page.getByRole('main');
          await expect(
            page.getByText(
              `Es wurden ${visibleTitles.length} Beiträge gefunden`
            )
          ).toBeVisible();
          for (const title of visibleTitles) {
            await expect(
              results.getByRole('link', { name: title })
            ).toBeVisible();
          }
          for (const title of [teachersArticle.title, draft.title]) {
            if (!visibleTitles.includes(title)) {
              await expect(results.getByText(title)).toHaveCount(0);
            }
          }
        });
      }

      await test.step('a result leads to the article', async () => {
        const page = await openPageAs('guest');
        await search(page, baseURL, word);
        await page
          .getByRole('main')
          .getByRole('link', { name: publicArticle.title })
          .click();
        await page.waitForURL(`**${publicArticle.path}`);
        await expect(
          page.getByRole('heading', { name: publicArticle.title })
        ).toBeVisible();
      });
    }
  );

  test('keeps what was typed before the page was hydrated', async ({
    page,
    baseURL,
    graphqlAs,
  }) => {
    const word = `Fruehstarter${Date.now().toString(36)}`;
    const gql = await graphqlAs('admin');
    const category = await createCategory(gql, { title: `Suche ${word}` });
    const article = await createArticle(gql, {
      title: `Artikel ${word}`,
      categoryId: category.id,
    });

    // hold back the JavaScript until the user has typed
    let releaseScripts!: () => void;
    const scriptsReleased = new Promise<void>((r) => (releaseScripts = r));
    await page.route('**/_next/static/chunks/**/*.js', async (route) => {
      await scriptsReleased;
      await route.continue();
    });

    await page.goto(baseURL + '/search', { waitUntil: 'commit' });
    const searchbox = page.getByRole('searchbox', { name: 'Suchbegriff' });
    await searchbox.fill(word);
    releaseScripts();

    await expect(
      page.getByRole('main').getByRole('link', { name: article.title })
    ).toBeVisible({ timeout: 20_000 });
    await expect(searchbox).toHaveValue(word);
  });
});
