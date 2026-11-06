import { expect, tenantTest as test } from '../fixtures';
import { uploadAndSelect } from '../helper/fileManager';

test.describe('Tenant administration', () => {
  test.describe('general settings', () => {
    test.use({ loginAs: 'admin' });

    test.beforeEach(async ({ page, takeScreenshot }) => {
      await page.goto('/admin');

      await takeScreenshot('admin-settings');

      await page.getByRole('button', { name: /allgemein/i }).click();
      await page.waitForURL('**/admin/general');

      await takeScreenshot('admin-settings-general');
    });

    test('should be able to update the tenant name', async ({
      page,
      browser,
      baseURL,
    }) => {
      // The tenant is shared by all tests of this worker, so don't assume its current title
      const newTitle = `Example Lotta Schule ${test.info().testId}`;
      const titleInput = page.getByRole('textbox', { name: 'Name der Seite' });

      await expect(titleInput).not.toHaveValue('');
      await titleInput.fill(newTitle);

      const saveButton = page.getByRole('button', { name: /speichern/i });
      await saveButton.click();
      await expect(saveButton).toBeDisabled();
      await expect(saveButton).not.toBeDisabled();

      await page.reload();
      await expect(titleInput).toHaveValue(newTitle);

      // A visitor (not logged in) should see the new title
      const guestContext = await browser.newContext();
      const guestPage = await guestContext.newPage();

      await guestPage.goto(baseURL);

      await expect(guestPage).toHaveTitle(newTitle);
      await expect(guestPage.getByRole('banner')).toContainText(newTitle);

      await guestContext.close();
    });

    test('should be able to update the tenant logo', async ({
      page,
      browser,
      baseURL,
      isMobile,
    }) => {
      const editOverlay = page
        .getByLabel('Logo der Seite')
        .getByTestId('EditOverlay');

      await editOverlay.click();

      await uploadAndSelect(
        { page },
        'Meine Bilder',
        'fixtures/images/logo.png'
      );

      // TODO: Find smth better
      await expect(editOverlay.locator('img')).toBeVisible();

      const saveButton = page.getByRole('button', { name: /speichern/i });
      await saveButton.click();
      await expect(saveButton).toBeDisabled();
      await expect(saveButton).not.toBeDisabled();

      const guestContext = await browser.newContext();
      const guestPage = await guestContext.newPage();

      await guestPage.goto(baseURL);

      if (!isMobile) {
        await expect(
          guestPage.getByRole('banner').locator('img')
        ).toBeVisible();
      }

      await guestContext.close();
    });
  });
});
