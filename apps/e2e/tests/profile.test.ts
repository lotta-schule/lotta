import { expect, tenantTest as test } from '../fixtures';

test.describe('Profile', () => {
  test.describe('as admin', () => {
    test.use({ loginAs: 'admin' });

    test.beforeEach(async ({ page, takeScreenshot }) => {
      await page.goto('/profile');
      await expect(page.locator('h4')).toContainText('Meine Daten');

      await takeScreenshot('profile-basic-information');
    });

    test('should show correct basic information', async ({ page, admin }) => {
      await expect(
        page.getByRole('textbox', { name: 'Dein Vor- und Nachname' })
      ).toHaveValue(admin.name);
      await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(
        admin.email
      );

      await expect(
        page
          .getByTestId('ProfileData-GroupsList')
          .getByRole('listitem')
          .filter({ hasText: 'Administrator' })
      ).toBeVisible();
    });
  });
});
