import { expect, tenantTest as test } from '../fixtures';
import {
  clickUserMenuEntry,
  getCurrentUserEmail,
  loginUser,
  loginUserRequiringPWUpdate,
  loginViaApi,
  uniqueEmail,
  waitForSentMail,
} from '../helper';

test.describe('Authentication', () => {
  test(
    'a user can log in with email and password',
    { tag: '@smoke' },
    async ({ page, baseURL, isMobile, users }) => {
      await loginUser({ page, baseURL, isMobile }, users.teacher);

      expect(await getCurrentUserEmail(page.request, baseURL)).toBe(
        users.teacher.email
      );
    }
  );

  test('a user cannot log in with a wrong password', async ({
    page,
    baseURL,
    isMobile,
    users,
  }) => {
    await page.goto('/');

    if (isMobile) {
      await page.getByRole('button', { name: /menü öffnen/i }).click();
      await expect(page.getByTestId('BaseLayoutSidebar')).toBeVisible();
    }

    await page.getByRole('button', { name: /anmelden/i }).click();
    const loginDialog = page.getByRole('dialog', { name: /anmelden/i });

    await loginDialog
      .getByRole('textbox', { name: /e-mail/i })
      .fill(users.teacher.email);
    await loginDialog
      .getByRole('textbox', { name: /passwort/i })
      .fill('definitely-wrong');

    const loginResponse = page.waitForResponse(
      (res) =>
        res.url().endsWith('/auth/login') && res.request().method() === 'POST'
    );
    await loginDialog.getByRole('button', { name: /anmelden/i }).click();

    expect((await loginResponse).status()).toBe(401);

    // the dialog stays open, shows the error and keeps the email
    await expect(loginDialog.getByRole('alert')).toHaveText(
      'E-Mail-Adresse oder Passwort ist falsch.'
    );
    await expect(
      loginDialog.getByRole('textbox', { name: /e-mail/i })
    ).toHaveValue(users.teacher.email);
    expect(await getCurrentUserEmail(page.request, baseURL)).toBeNull();
  });

  test('a new user has to change the generated password on first login', async ({
    page,
    baseURL,
    isMobile,
    seed,
  }) => {
    const {
      users: [user],
    } = await seed({
      users: [{ name: 'Pippin Tuk', email: uniqueEmail('pippin') }],
    });

    await loginUserRequiringPWUpdate(
      { page, baseURL, isMobile },
      { ...user, newPassword: 'second-breakfast' }
    );

    // the new password works, the generated one doesn't anymore
    const freshContext = await page.context().browser()!.newContext();
    await expect(
      loginViaApi(freshContext.request, baseURL, user)
    ).rejects.toThrow();
    await loginViaApi(freshContext.request, baseURL, {
      email: user.email,
      password: 'second-breakfast',
    });
    expect(await getCurrentUserEmail(freshContext.request, baseURL)).toBe(
      user.email
    );
    await freshContext.close();
  });

  test.describe('logged in', () => {
    test.use({ loginAs: 'student' });

    test('a user can log out', async ({ page, baseURL, isMobile, users }) => {
      await page.goto('/');
      expect(await getCurrentUserEmail(page.request, baseURL)).toBe(
        users.student.email
      );

      await clickUserMenuEntry(page, isMobile, {
        desktop: /abmelden/i,
        mobile: 'Abmelden',
      });

      await expect(
        page.getByRole('button', { name: /anmelden/i })
      ).toBeVisible();
      expect(await getCurrentUserEmail(page.request, baseURL)).toBeNull();
    });
  });

  test('a user can reset a forgotten password via email', async ({
    page,
    baseURL,
    seed,
  }) => {
    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: 'Merry Brandybock',
          email: uniqueEmail('merry'),
          password: 'old-password',
        },
      ],
    });

    await page.goto('/password/request-reset');
    await page
      .getByRole('textbox', { name: /deine email-adresse/i })
      .fill(user.email);
    await page.getByRole('button', { name: /anfrage senden/i }).click();
    await expect(page.getByText(/sieh in deinem postfach nach/i)).toBeVisible();

    const mail = await waitForSentMail(
      (mail) =>
        mail.subject.includes('Passwort zurücksetzen') &&
        mail.to.some(([, address]) => address === user.email),
      { timeout: 15_000 }
    );
    // The link is followed by a period in the mail text, which is not part of it
    const resetLink = mail.text_body
      .match(/https?:\/\/\S+\/password\/reset\?\S+/)?.[0]
      .replace(/\.$/, '');
    expect(resetLink, 'reset link in mail').toBeTruthy();

    await page.goto(resetLink!);
    await page
      .getByRole('textbox', { name: 'Dein neues Passwort:' })
      .fill('new-password');
    await page
      .getByRole('textbox', { name: /wiederhole dein neues passwort/i })
      .fill('new-password');
    await page.getByRole('button', { name: /passwort setzen/i }).click();
    await page.waitForURL(baseURL + '/');

    const freshContext = await page.context().browser()!.newContext();
    await expect(
      loginViaApi(freshContext.request, baseURL, user)
    ).rejects.toThrow();
    await loginViaApi(freshContext.request, baseURL, {
      email: user.email,
      password: 'new-password',
    });
    await freshContext.close();
  });
});
