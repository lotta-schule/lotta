import { Page } from '@playwright/test';
import { expect, tenantTest as test } from '../fixtures';
import {
  graphql,
  loginUserRequiringPWUpdate,
  loginViaApi,
  uniqueEmail,
  waitForSentMail,
} from '../helper';

/** Registers through the "Registrieren" dialog, returns the password from the mail */
const register = async (
  page: Page,
  {
    email,
    firstName,
    lastName,
    enrollmentKey,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    enrollmentKey?: string;
  }
) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Registrieren' }).click();

  const dialog = page.getByRole('dialog', { name: 'Benutzerkonto erstellen' });
  await dialog.getByRole('textbox', { name: /email-adresse/i }).fill(email);
  await dialog.getByRole('textbox', { name: 'Vorname' }).fill(firstName);
  await dialog.getByRole('textbox', { name: 'Nachname' }).fill(lastName);
  if (enrollmentKey) {
    await dialog
      .getByRole('textbox', { name: 'Anmeldeschlüssel:' })
      .fill(enrollmentKey);
  }
  await dialog.getByRole('button', { name: 'Registrieren' }).click();

  await expect(
    dialog.getByText(/Dein Benutzerkonto wurde erfolgreich eingerichtet/)
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Schließen', exact: true }).click();

  const mail = await waitForSentMail(
    (mail) =>
      mail.subject.startsWith('Deine Registrierung bei') &&
      mail.to.some(([, address]) => address === email),
    { timeout: 15_000 }
  );
  const password = mail.text_body.match(/Passwort: (\S+)/)?.[1];
  expect(password, 'password in registration mail').toBeTruthy();
  return password!;
};

test.describe('Registration', () => {
  test(
    'a visitor registers, gets a password by mail and has to change it on first login',
    { tag: '@smoke' },
    async ({ page, baseURL, isMobile, playwright }) => {
      test.skip(
        isMobile,
        'The registration dialog is opened from the sidebar on mobile'
      );

      const email = uniqueEmail('merry');
      const password = await register(page, {
        email,
        firstName: 'Meriadoc',
        lastName: 'Brandybock',
      });

      await loginUserRequiringPWUpdate(
        { page, baseURL, isMobile },
        { email, password, newPassword: 'pfeifenkraut' }
      );

      const request = await playwright.request.newContext();
      await loginViaApi(request, baseURL, { email, password: 'pfeifenkraut' });
      await request.dispose();
    }
  );

  test('a visitor registering with an enrollment key joins the group', async ({
    page,
    baseURL,
    isMobile,
    playwright,
    seed,
  }) => {
    test.skip(
      isMobile,
      'The registration dialog is opened from the sidebar on mobile'
    );

    const id = Date.now().toString(36);
    const enrollmentKey = `chor-${id}`;
    await seed({
      groups: [{ name: `Schulchor ${id}`, enrollmentTokens: [enrollmentKey] }],
    });

    const email = uniqueEmail('pippin');
    const password = await register(page, {
      email,
      firstName: 'Peregrin',
      lastName: 'Tuk',
      enrollmentKey,
    });

    const request = await playwright.request.newContext();
    await loginViaApi(request, baseURL, { email, password });
    const { body } = await graphql<{
      currentUser: { groups: { name: string }[] };
    }>(request, baseURL, 'query { currentUser { groups { name } } }');
    expect(body?.data?.currentUser.groups.map((g) => g.name)).toContain(
      `Schulchor ${id}`
    );
    await request.dispose();
  });
});
