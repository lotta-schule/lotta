import { clickUserMenuEntry } from '../helper';
import { capture, desktopOnly, docsTest as test, expect } from './fixtures';

/** Docs: "Anmelden & Registrieren", "Mein Profil", "Feedback senden" */
test.describe('Konto und Profil', () => {
  desktopOnly();

  test('register dialog', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('RegisterButton').click();
    const dialog = page.getByRole('dialog', {
      name: 'Benutzerkonto erstellen',
    });
    await expect(dialog).toBeVisible();

    await dialog
      .getByLabel('Deine Email-Adresse:')
      .fill('jonas.becker@example.de');
    await dialog.getByLabel('Vorname').fill('Jonas');
    await dialog.getByLabel('Nachname').fill('Becker');
    await dialog.getByLabel('Spitzname').fill('Jo');

    await capture(page, 'register-dialog', {
      locator: dialog,
      highlight: dialog.getByRole('button', { name: 'Registrieren' }),
    });
  });

  test.describe('as a student', () => {
    test.use({ loginAs: 'student' });

    test('profile', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByTestId('UserName')).toBeVisible();

      await capture(page, 'profile', { fullPage: true });
    });

    test('enrollment tokens', async ({ page }) => {
      await page.goto('/profile');
      const editor = page.getByTestId('UserEnrollmentTokensInput');
      const input = page.getByRole('textbox', {
        name: 'Neue Einschreibeschlüssel eintragen',
      });
      await input.fill('Sonnenblume-7b-2026');
      await input.press('Enter');
      const token = page
        .getByRole('listitem')
        .filter({ hasText: 'Sonnenblume-7b-2026' });
      await expect(token).toBeVisible();

      await capture(page, 'profile-enrollment-tokens', {
        locator: editor,
        highlight: token,
      });
    });

    test('feedback dialog', async ({ page }) => {
      await page.goto('/');
      await clickUserMenuEntry(page, false, {
        desktop: 'Feedback',
        mobile: 'Feedback',
      });
      const dialog = page.getByRole('dialog', { name: 'Feedback schreiben' });
      await dialog
        .getByRole('textbox', { name: 'Thema auswählen oder kurz beschreiben' })
        .fill('Stundenplan wird nicht angezeigt');
      await dialog
        .getByRole('textbox', { name: /^Nachricht/ })
        .fill(
          'Seit heute Morgen zeigt die Marginale „Vertretungsplan“ keine Stunden mehr an.'
        );

      await capture(page, 'feedback-dialog', {
        locator: dialog,
        highlight: dialog.getByRole('button', {
          name: 'an Administratoren senden',
        }),
      });
    });
  });
});
