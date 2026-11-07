import { Page } from '@playwright/test';
import { expect, tenantTest as test } from '../fixtures';

const createCategory = async (
  page: Page,
  title: string,
  { parent }: { parent?: string } = {}
) => {
  await page.goto('/admin/categories');
  await page.getByRole('button', { name: 'Kategorie erstellen' }).click();

  const dialog = page.getByRole('dialog', { name: 'Kategorie erstellen' });
  await dialog
    .getByRole('textbox', { name: 'Name der Kategorie:' })
    .fill(title);
  if (parent) {
    await dialog.getByRole('radio', { name: 'Subnavigation' }).check();
    await dialog
      .getByRole('button', { name: /Übergeordnete Kategorie/ })
      .click();
    await page.getByRole('option', { name: parent }).click();
  }
  await dialog.getByRole('button', { name: 'Kategorie erstellen' }).click();
  await expect(dialog).toBeHidden();
  // the new category opens in the editor: wait for it, before navigating anywhere else
  await page.waitForURL(/\/admin\/categories\/\d+$/);
  await expect(
    page.getByRole('textbox', { name: 'Name der Kategorie' })
  ).toHaveValue(title);
};

/** The category buttons of the main navigation (first) and subnavigation (second) */
const navigation = (page: Page) => page.getByRole('navigation').first();

const openCategoryInAdmin = async (
  page: Page,
  title: string,
  { parent }: { parent?: string } = {}
) => {
  await page.goto('/admin/categories');
  if (parent) {
    // subcategories are collapsed under their parent
    await page
      .getByRole('main')
      .getByRole('listitem', { name: parent, exact: true })
      .getByRole('button', { name: 'Unterkategorien anzeigen' })
      .click();
  }
  await page.getByRole('main').getByText(title, { exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Name der Kategorie' })
  ).toHaveValue(title);
};

test.describe('Category administration', () => {
  test.use({ loginAs: 'admin' });

  test(
    'an admin creates, renames and deletes categories, the navigation follows',
    { tag: '@smoke' },
    async ({ page, baseURL, openPageAs }) => {
      const id = Date.now().toString(36);
      const parent = `Arbeitsgemeinschaften ${id}`;
      const child = `Theater AG ${id}`;
      const renamed = `AGs ${id}`;

      await test.step('create a main category and a subcategory', async () => {
        await createCategory(page, parent);
        await createCategory(page, child, { parent });
      });

      await test.step('visitors see them in the navigation', async () => {
        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL);
        await navigation(guestPage)
          .getByRole('button', { name: parent })
          .click();
        await expect(
          guestPage.getByRole('navigation').getByRole('button', { name: child })
        ).toBeVisible();
      });

      await test.step('rename the main category', async () => {
        await openCategoryInAdmin(page, parent);
        await page
          .getByRole('textbox', { name: 'Name der Kategorie' })
          .fill(renamed);
        await page
          .getByRole('button', { name: 'speichern', exact: true })
          .click();

        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL);
        await expect(
          navigation(guestPage).getByRole('button', { name: renamed })
        ).toBeVisible();
        await expect(
          navigation(guestPage).getByRole('button', { name: parent })
        ).toHaveCount(0);
      });

      await test.step('delete the subcategory', async () => {
        await openCategoryInAdmin(page, child, { parent: renamed });
        await page
          .getByRole('button', { name: 'löschen', exact: true })
          .click();
        const dialog = page.getByRole('dialog', { name: 'Kategorie löschen' });
        await dialog
          .getByRole('button', { name: 'Kategorie endgültig löschen' })
          .click();
        await expect(dialog).toBeHidden();

        const guestPage = await openPageAs('guest');
        await guestPage.goto(baseURL);
        await navigation(guestPage)
          .getByRole('button', { name: renamed })
          .click();
        await expect(
          guestPage.getByRole('navigation').getByRole('button', { name: child })
        ).toHaveCount(0);
      });
    }
  );
});
