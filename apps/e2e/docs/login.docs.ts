import { capture, docsTest as test, expect } from './fixtures';
import { openMobileDrawer } from '../helper';

/** Docs: "Anmelden" (apps/docs) */
test.describe('Anmelden', () => {
  test('login dialog', async ({ page, users, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      await openMobileDrawer(page);
    }
    const loginButton = page.getByRole('button', { name: /anmelden/i });
    await capture(page, 'login-button', { highlight: loginButton });

    await loginButton.click();
    const dialog = page.getByRole('dialog', { name: /anmelden/i });
    await expect(dialog).toBeVisible();

    await dialog
      .getByRole('textbox', { name: /e-mail/i })
      .fill(users.teacher.email);
    await dialog
      .getByRole('textbox', { name: /passwort/i })
      .fill(users.teacher.password);

    await capture(page, 'login-dialog', {
      locator: dialog,
      highlight: dialog.getByRole('button', { name: /anmelden/i }),
    });
  });

  test('login flow (video)', async ({ recordVideo, users, isMobile }) => {
    await recordVideo('login', { as: 'guest' }, async (page) => {
      await page.goto('/');
      if (isMobile) {
        await openMobileDrawer(page);
      }
      await page.getByRole('button', { name: /anmelden/i }).click();

      const dialog = page.getByRole('dialog', { name: /anmelden/i });
      await dialog
        .getByRole('textbox', { name: /e-mail/i })
        .pressSequentially(users.teacher.email, { delay: 40 });
      await dialog
        .getByRole('textbox', { name: /passwort/i })
        .pressSequentially(users.teacher.password, { delay: 40 });
      await dialog.getByRole('button', { name: /anmelden/i }).click();
      await expect(dialog).toBeHidden();
    });
  });
});
