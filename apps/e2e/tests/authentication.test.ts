import { expect, test } from '../fixtures';

// TODO: Maybe find something else. This is already done in setup
test.describe('Authentication', () => {
  test('Login to page as admin', async ({ page, baseURL, admin, isMobile }) => {
    await page.goto(baseURL!);

    if (isMobile) {
      await page.getByRole('button', { name: /nutzermenü öffnen/i }).click();
    }
    const loginButton = page.getByRole('button', { name: /anmelden/i });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    const loginDialog = page.getByRole('dialog', { name: /anmelden/i });

    await loginDialog.waitFor({ state: 'visible' });

    await loginDialog
      .getByRole('textbox', { name: /email/i })
      .fill(admin.email);

    await loginDialog
      .getByRole('textbox', { name: /passwort/i })
      .fill(admin.password);

    // await page.keyboard.press('Enter');
    await loginDialog.getByRole('button', { name: /anmelden/i }).click();

    await loginDialog.waitFor({ state: 'hidden' });

    if (isMobile) {
      await page.getByRole('button', { name: /menü öffnen/i }).click();
    }

    await expect(page.getByRole('button', { name: 'Profil' })).toBeVisible();
  });
});
