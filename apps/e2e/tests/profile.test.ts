import { expect, tenantTest as test } from '../fixtures';
import { loginUser } from '../helper';
import { screenSave } from '../screenSave';

test.describe('Profile', () => {
  test.describe('as admin', () => {
    test.beforeEach(async ({ page, baseURL, isMobile, admin }) => {
      const { loginDialog } = await loginUser(
        { page, baseURL, isMobile },
        admin
      );
      await expect(loginDialog).not.toBeVisible();
      await page.goto(`${baseURL}/profile`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h4')).toContainText('Meine Daten');

      await screenSave(await page.screenshot(), 'profile-basic-information');
    });

    test('should show correct basic information', async ({ page, admin }) => {
      expect(
        page.getByRole('textbox', { name: 'Dein Vor- und Nachname' })
      ).toHaveValue(admin.name);
      expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(
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
