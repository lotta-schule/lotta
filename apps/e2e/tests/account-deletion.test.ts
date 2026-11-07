import { PlaywrightWorkerArgs } from '@playwright/test';
import { expect, GUEST_STATE, tenantTest as test } from '../fixtures';
import {
  graphql,
  loginViaApi,
  SeededUser,
  uniqueEmail,
  waitForSentMail,
} from '../helper';

const canLogin = async (
  playwright: PlaywrightWorkerArgs['playwright'],
  baseURL: string,
  user: SeededUser
) => {
  const request = await playwright.request.newContext();
  try {
    await loginViaApi(request, baseURL, user);
    return true;
  } catch {
    return false;
  } finally {
    await request.dispose();
  }
};

const waitForClosedAccountMail = (user: SeededUser) =>
  waitForSentMail(
    (mail) =>
      mail.subject.startsWith('Dein Benutzerkonto bei') &&
      mail.to.some(([, address]) => address === user.email),
    { timeout: 15_000 }
  );

test.describe('Account deletion', () => {
  test('a user deletes their own account', async ({
    browser,
    baseURL,
    isMobile,
    playwright,
    seed,
  }) => {
    test.skip(isMobile, 'Not tested on mobile yet');

    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: 'Ted Sandigmann',
          email: uniqueEmail('ted'),
          password: 'muehle123',
        },
      ],
    });

    const context = await browser.newContext({ storageState: GUEST_STATE });
    await loginViaApi(context.request, baseURL, user);
    const page = await context.newPage();
    // the page confirms the deletion with a browser alert
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto(baseURL + '/profile/delete');

    for (let step = 0; step < 3; step++) {
      await page.getByRole('button', { name: 'Weiter' }).click();
    }
    await page.getByRole('button', { name: 'Daten endgültig löschen' }).click();

    const dialog = page.getByRole('dialog', {
      name: 'Benutzerkonto wirklich löschen?',
    });
    await dialog
      .getByRole('button', { name: 'Jetzt alle Daten endgültig löschen' })
      .click();
    await page.waitForURL((url) => !url.pathname.startsWith('/profile'));

    expect(await canLogin(playwright, baseURL, user)).toBe(false);
    const mail = await waitForClosedAccountMail(user);
    expect(mail.subject).toContain('wurde gelöscht');
    await context.close();
  });

  test.describe('as admin', () => {
    test.use({ loginAs: 'admin' });

    test('an admin deletes a user', async ({
      page,
      baseURL,
      isMobile,
      playwright,
      seed,
    }) => {
      test.skip(
        isMobile,
        'The user administration is not tested on mobile yet'
      );

      const name = `Lobelia Sackheim ${Date.now().toString(36)}`;
      const {
        users: [user],
      } = await seed({
        users: [{ name, email: uniqueEmail('lobelia'), password: 'loeffel' }],
      });
      expect(await canLogin(playwright, baseURL, user)).toBe(true);

      await page.goto('/admin/users');
      await page
        .getByRole('textbox', { name: 'Nach Namen suchen:' })
        .fill(name);
      await page.getByRole('row').filter({ hasText: name }).click();
      await page
        .getByRole('dialog', { name: `${name} bearbeiten` })
        .getByRole('button', { name: 'Benutzer löschen' })
        .click();

      const dialog = page.getByRole('dialog', { name: `${name} löschen` });
      await dialog.getByRole('button', { name: 'weiter' }).click();
      await dialog.getByRole('button', { name: 'weiter' }).click();
      await dialog.getByRole('button', { name: 'endgültig löschen' }).click();
      await expect(dialog).toBeHidden();

      expect(await canLogin(playwright, baseURL, user)).toBe(false);
    });
  });

  test('a user cannot delete somebody else', async ({
    playwright,
    baseURL,
    users,
    seed,
  }) => {
    const {
      users: [victim],
    } = await seed({
      users: [
        {
          name: 'Rosa Bolger',
          email: uniqueEmail('rosa'),
          password: 'garten123',
        },
      ],
    });
    const request = await playwright.request.newContext();
    await loginViaApi(request, baseURL, users.student);
    const { body } = await graphql(
      request,
      baseURL,
      'mutation Destroy($userId: ID!) { destroyAccount(userId: $userId) { id } }',
      { variables: { userId: String(victim.id) } }
    );
    await request.dispose();

    expect(body?.errors?.length).toBeGreaterThan(0);
    expect(await canLogin(playwright, baseURL, victim)).toBe(true);
  });
});
