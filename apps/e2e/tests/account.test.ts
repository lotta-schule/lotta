import { Browser, Page, PlaywrightWorkerArgs } from '@playwright/test';
import { expect, GUEST_STATE, tenantTest as test } from '../fixtures';
import { loginViaApi, SeededUser, uniqueEmail } from '../helper';

/** Opens the profile page, logged in as the given (seeded) user */
const openProfileAs = async (
  browser: Browser,
  baseURL: string,
  user: SeededUser
): Promise<Page> => {
  const context = await browser.newContext({ storageState: GUEST_STATE });
  await loginViaApi(context.request, baseURL, user);
  const page = await context.newPage();
  await page.goto(baseURL + '/profile');
  return page;
};

/** Confirms a security-relevant change with the user's current password */
const confirmWithPassword = async (page: Page, password: string) => {
  const dialog = page.getByRole('dialog', {
    name: 'Durch Passwort bestätigen',
  });
  await dialog.getByRole('textbox', { name: 'Passwort:' }).fill(password);
  await dialog.getByRole('button', { name: 'senden' }).click();
  await expect(dialog).toBeHidden();
};

const canLogin = async (
  playwright: PlaywrightWorkerArgs['playwright'],
  baseURL: string,
  credentials: { email: string; password: string }
) => {
  const request = await playwright.request.newContext();
  try {
    await loginViaApi(request, baseURL, credentials);
    return true;
  } catch {
    return false;
  } finally {
    await request.dispose();
  }
};

test.describe('Account', () => {
  test('a user changes their password, confirmed with the current one', async ({
    browser,
    baseURL,
    playwright,
    seed,
  }) => {
    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: 'Fredegar Bolger',
          email: uniqueEmail('dick'),
          password: 'alter-schluessel',
        },
      ],
    });
    const newPassword = 'neuer-schluessel';

    const page = await openProfileAs(browser, baseURL, user);
    await page.getByRole('button', { name: 'Passwort ändern' }).click();

    const dialog = page.getByRole('dialog', { name: 'Passwort ändern' });
    await dialog
      .getByRole('textbox', { name: 'Neues Passwort:', exact: true })
      .fill(newPassword);
    await dialog
      .getByRole('textbox', { name: 'Wiederholung Neues Passwort:' })
      .fill(newPassword);
    await dialog.getByRole('button', { name: 'Passwort ändern' }).click();

    await confirmWithPassword(page, user.password);
    await expect(dialog).toBeHidden();

    expect(await canLogin(playwright, baseURL, user)).toBe(false);
    expect(
      await canLogin(playwright, baseURL, {
        email: user.email,
        password: newPassword,
      })
    ).toBe(true);
    await page.context().close();
  });

  test('a user changes their email, confirmed with their password', async ({
    browser,
    baseURL,
    playwright,
    seed,
  }) => {
    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: 'Folco Boffin',
          email: uniqueEmail('folco'),
          password: 'boffin123',
        },
      ],
    });
    const newEmail = uniqueEmail('folco-neu');

    const page = await openProfileAs(browser, baseURL, user);
    await page.getByRole('button', { name: 'Email ändern' }).click();

    const dialog = page.getByRole('dialog', { name: 'Email ändern' });
    await dialog.getByRole('textbox', { name: 'Neue Email:' }).fill(newEmail);
    await dialog.getByRole('button', { name: 'Email ändern' }).click();

    await confirmWithPassword(page, user.password);
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(
      newEmail
    );

    expect(await canLogin(playwright, baseURL, user)).toBe(false);
    expect(
      await canLogin(playwright, baseURL, {
        email: newEmail,
        password: user.password,
      })
    ).toBe(true);
    await page.context().close();
  });

  test('a password change is rejected with a wrong current password', async ({
    browser,
    baseURL,
    playwright,
    seed,
  }) => {
    const {
      users: [user],
    } = await seed({
      users: [
        {
          name: 'Lotho Sackheim',
          email: uniqueEmail('lotho'),
          password: 'beutelsend',
        },
      ],
    });

    const page = await openProfileAs(browser, baseURL, user);
    await page.getByRole('button', { name: 'Passwort ändern' }).click();

    const dialog = page.getByRole('dialog', { name: 'Passwort ändern' });
    await dialog
      .getByRole('textbox', { name: 'Neues Passwort:', exact: true })
      .fill('uebernommen');
    await dialog
      .getByRole('textbox', { name: 'Wiederholung Neues Passwort:' })
      .fill('uebernommen');
    await dialog.getByRole('button', { name: 'Passwort ändern' }).click();

    const confirmDialog = page.getByRole('dialog', {
      name: 'Durch Passwort bestätigen',
    });
    await confirmDialog
      .getByRole('textbox', { name: 'Passwort:' })
      .fill('geraten');
    await confirmDialog.getByRole('button', { name: 'senden' }).click();
    await expect(confirmDialog).toBeVisible();

    expect(await canLogin(playwright, baseURL, user)).toBe(true);
    expect(
      await canLogin(playwright, baseURL, {
        email: user.email,
        password: 'uebernommen',
      })
    ).toBe(false);
    await page.context().close();
  });
});
