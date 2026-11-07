import { Page } from '@playwright/test';
import { expect, tenantTest as test } from '../fixtures';
import { createArticle, createCategory } from '../helper';

const reactWithHeart = async (page: Page, articleTitle: string) => {
  await page
    .getByRole('button', { name: `Auf "${articleTitle}" reagieren` })
    .click();
  // the reaction buttons only have an icon and no accessible name
  await page.getByTestId('reaction-HEART').click();
};

test.describe('Article engagement', () => {
  test('logged-in users react to an article, visitors see the reactions', async ({
    baseURL,
    graphqlAs,
    openPageAs,
  }) => {
    const id = Date.now().toString(36);
    const gql = await graphqlAs('admin');
    const category = await createCategory(gql, { title: `Reaktionen ${id}` });
    const article = await createArticle(gql, {
      title: `Sommerfest ${id}`,
      categoryId: category.id,
      isReactionsEnabled: true,
    });

    for (const role of ['student', 'teacher'] as const) {
      await test.step(`${role} reacts with a heart`, async () => {
        const page = await openPageAs(role);
        await page.goto(baseURL + article.path);
        const reactionsRequest = page.waitForResponse(
          (res) =>
            res.url().endsWith('/api') &&
            (res.request().postData() ?? '').includes('reactToArticle')
        );
        await reactWithHeart(page, article.title);
        expect((await reactionsRequest).ok()).toBe(true);
      });
    }

    await test.step('a visitor sees two hearts but cannot react', async () => {
      const page = await openPageAs('guest');
      await page.goto(baseURL + article.path);
      // the react button is not offered to visitors (missing or disabled)
      await expect(
        page
          .getByRole('button', { name: `Auf "${article.title}" reagieren` })
          .and(page.locator(':enabled'))
      ).toHaveCount(0);
      await expect(
        page.getByRole('main').getByText('2', { exact: true })
      ).toBeVisible();
    });
  });

  test.describe('pinning', () => {
    test.use({ loginAs: 'admin' });

    test('an admin pins an article, which then comes first in its category', async ({
      page,
      baseURL,
      graphqlAs,
      openPageAs,
    }) => {
      const id = Date.now().toString(36);
      const gql = await graphqlAs('admin');
      const category = await createCategory(gql, { title: `Pinnwand ${id}` });
      const older = await createArticle(gql, {
        title: `Alter Beitrag ${id}`,
        categoryId: category.id,
      });
      const newer = await createArticle(gql, {
        title: `Neuer Beitrag ${id}`,
        categoryId: category.id,
      });

      const articleTitles = (p: Page) =>
        p
          .getByRole('main')
          .getByRole('heading', { level: 1 })
          .filter({ hasText: id })
          .allInnerTexts();

      const guestPage = await openPageAs('guest');
      await guestPage.goto(baseURL + category.path);
      expect((await articleTitles(guestPage))[0]).toContain(newer.title);

      await page.goto(older.path);
      await page
        .getByRole('button', { name: 'Beitrag an der Kategorie anpinnen' })
        .click();
      await expect(
        page.getByRole('button', { name: /anpinnen|lösen/ })
      ).toBeVisible();

      await expect(async () => {
        await guestPage.reload();
        expect((await articleTitles(guestPage))[0]).toContain(older.title);
      }).toPass();
    });
  });
});
