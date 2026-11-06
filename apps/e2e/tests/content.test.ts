import { Browser } from '@playwright/test';
import { expect, Role, StorageState, tenantTest as test } from '../fixtures';
import { createArticle, createCategory } from '../helper';

type AuthStateGetter = (role: Exclude<Role, 'guest'>) => Promise<StorageState>;

/** Opens a page in a new browser context, logged in as the given role */
const openPageAs = async (
  browser: Browser,
  getAuthState: AuthStateGetter,
  role: Role
) => {
  const context = await browser.newContext({
    storageState: role === 'guest' ? undefined : await getAuthState(role),
  });
  return { page: await context.newPage(), close: () => context.close() };
};

const uniqueTitle = (prefix: string) =>
  `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

test.describe('Content visibility', () => {
  // By design, a category's groups only control whether the category shows up in
  // the navigation. Access to the articles in it depends on the articles' own groups.
  test('a category restricted to a group is only shown to its members', async ({
    browser,
    baseURL,
    isMobile,
    graphqlAs,
    getAuthState,
    seed,
  }) => {
    const {
      groups: [teachers],
    } = await seed({ groups: [{ name: 'Lehrer' }] });

    const gql = await graphqlAs('admin');
    const category = await createCategory(gql, {
      title: uniqueTitle('Lehrerzimmer'),
      groupIds: [teachers.id],
    });
    const article = await createArticle(gql, {
      title: uniqueTitle('Konferenzprotokoll'),
      categoryId: category.id,
    });

    const expectations: [Role, boolean][] = [
      ['teacher', true],
      ['student', false],
      ['guest', false],
    ];

    for (const [role, canSee] of expectations) {
      await test.step(`${role} ${canSee ? 'can' : 'cannot'} see it`, async () => {
        const { page, close } = await openPageAs(browser, getAuthState, role);

        if (!isMobile) {
          await page.goto(baseURL);
          await expect(
            page
              .getByRole('navigation')
              .first()
              .getByRole('button', { name: category.title })
          ).toHaveCount(canSee ? 1 : 0);
        }

        // the article has no groups of its own, so it can be opened by everyone
        await page.goto(baseURL + article.path);
        await expect(
          page.getByRole('main').getByText(article.title)
        ).not.toHaveCount(0);

        await close();
      });
    }
  });

  test(
    'an article restricted to a group is only visible to its members',
    { tag: '@smoke' },
    async ({ browser, baseURL, graphqlAs, getAuthState, seed }) => {
      const {
        groups: [students],
      } = await seed({ groups: [{ name: 'Schüler' }] });

      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, {
        title: uniqueTitle('Neuigkeiten'),
      });
      const publicArticle = await createArticle(gql, {
        title: uniqueTitle('Schulfest'),
        categoryId: category.id,
      });
      const restrictedArticle = await createArticle(gql, {
        title: uniqueTitle('Klassenfahrt'),
        categoryId: category.id,
        groupIds: [students.id],
      });

      const expectations: [Role, boolean][] = [
        ['student', true],
        ['teacher', false],
        ['guest', false],
      ];

      for (const [role, canSee] of expectations) {
        await test.step(`${role} ${canSee ? 'can' : 'cannot'} see it`, async () => {
          const { page, close } = await openPageAs(browser, getAuthState, role);

          await page.goto(baseURL + category.path);
          const main = page.getByRole('main');
          await expect(main.getByText(publicArticle.title)).not.toHaveCount(0);
          await expect(main.getByText(restrictedArticle.title)).toHaveCount(
            canSee ? 1 : 0
          );

          await close();
        });
      }
    }
  );
});

test.describe('Article lifecycle', () => {
  test(
    'a teacher writes an article, an admin publishes it, visitors can read it',
    { tag: '@smoke' },
    async ({ browser, baseURL, isMobile, graphqlAs, getAuthState }) => {
      test.skip(isMobile, 'The article editor is not tested on mobile yet');

      const category = await createCategory(await graphqlAs('admin'), {
        title: uniqueTitle('Projekte'),
      });
      const title = uniqueTitle('Unser Schulgarten');
      let editURL = '';

      await test.step('teacher writes and submits the article', async () => {
        const { page, close } = await openPageAs(
          browser,
          getAuthState,
          'teacher'
        );
        await page.goto(baseURL);

        await page.getByRole('button', { name: /neuer beitrag/i }).click();
        const dialog = page.getByRole('dialog', { name: /beitrag erstellen/i });
        await dialog
          .getByRole('textbox', { name: /titel des beitrags/i })
          .fill(title);
        await dialog
          .getByRole('button', { name: /beitrag erstellen/i })
          .click();
        await page.waitForURL(/\/a\/.+\/edit$/);
        editURL = page.url();

        const footer = page.getByTestId('EditArticleFooter');
        await footer.getByRole('button', { name: /kategorie wählen/i }).click();
        await page.getByRole('option', { name: category.title }).click();
        await footer.getByRole('radio', { name: 'submitted' }).check();
        await footer.getByRole('button', { name: /^speichern$/i }).click();
        await page.waitForURL((url) => !url.pathname.endsWith('/edit'));

        await close();
      });

      await test.step('visitors cannot see the unpublished article', async () => {
        const { page, close } = await openPageAs(
          browser,
          getAuthState,
          'guest'
        );
        await page.goto(baseURL + category.path);
        await expect(page.getByRole('main').getByText(title)).toHaveCount(0);

        // not even when opening the article directly
        await page.goto(editURL.replace(/\/edit$/, ''));
        await expect(page.getByRole('main').getByText(title)).toHaveCount(0);
        await close();
      });

      await test.step('admin publishes the article', async () => {
        const { page, close } = await openPageAs(
          browser,
          getAuthState,
          'admin'
        );
        await page.goto(baseURL + '/unpublished');
        await expect(page.getByRole('main').getByText(title)).not.toHaveCount(
          0
        );

        await page.goto(editURL.replace(/\/edit$/, ''));
        await page.getByRole('button', { name: /beitrag bearbeiten/i }).click();
        await page.waitForURL(/\/edit$/);

        const footer = page.getByTestId('EditArticleFooter');
        await footer.getByRole('radio', { name: 'published' }).check();
        await footer.getByRole('button', { name: /^speichern$/i }).click();
        await page.waitForURL((url) => !url.pathname.endsWith('/edit'));

        await close();
      });

      await test.step('visitors can read the published article', async () => {
        const { page, close } = await openPageAs(
          browser,
          getAuthState,
          'guest'
        );
        await page.goto(baseURL + category.path);
        await page.getByRole('main').getByText(title).first().click();
        await page.waitForURL(/\/a\//);
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        await close();
      });
    }
  );
});
