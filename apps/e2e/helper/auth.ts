import { Page, expect } from '@playwright/test';

export const loginUser = async (
  {
    page,
    baseURL,
    isMobile,
  }: { page: Page; baseURL: string; isMobile: boolean },
  user: {
    email: string;
    password: string;
  }
) => {
  await page.goto(baseURL);

  await page.waitForLoadState('domcontentloaded');

  if (isMobile) {
    await expect(
      page.getByRole('button', { name: /nutzermenü öffnen/i })
    ).toBeVisible();
    page.getByRole('button', { name: /menü öffnen/i }).click();
    await expect(page.getByTestId('BaseLayoutSidebar')).toBeVisible();
  }

  const loginButton = page.getByRole('button', { name: /anmelden/i });
  await loginButton.click();

  const loginDialog = page.getByRole('dialog', { name: /anmelden/i });
  await loginDialog.waitFor({ state: 'visible' });
  expect(loginDialog).toBeVisible();

  await loginDialog.getByRole('textbox', { name: /e-mail/i }).fill(user.email);

  await loginDialog
    .getByRole('textbox', { name: /passwort/i })
    .fill(user.password);

  // await page.keyboard.press('Enter');
  await loginDialog.getByRole('button', { name: /anmelden/i }).click();

  await page.waitForURL((url) => url.hostname === new URL(baseURL).hostname);
  await expect(loginDialog).not.toBeVisible();

  await page.waitForLoadState('domcontentloaded');
  await expect(loginDialog).not.toBeVisible();

  return {
    loginDialog,
  };
};

export const loginUserRequiringPWUpdate = async (
  {
    baseURL,
    page,
    isMobile,
  }: {
    baseURL: string;
    page: Page;
    isMobile: boolean;
  },
  user: { email: string; password: string; newPassword: string }
) => {
  const { loginDialog } = await loginUser({ baseURL, page, isMobile }, user);

  const updatePasswordDialog = page.getByRole('dialog', {
    name: /passwort ändern/i,
  });
  await expect(updatePasswordDialog).toBeVisible();

  // On first-ever try, there is an automatic password update
  await updatePasswordDialog.waitFor({ state: 'visible' });
  await updatePasswordDialog
    .getByRole('textbox', { name: 'Neues Passwort:', exact: true })
    .fill(user.newPassword);
  await updatePasswordDialog
    .getByRole('textbox', { name: 'Wiederholung Neues Passwort:' })
    .fill(user.newPassword);
  await page.keyboard.press('Enter');

  await updatePasswordDialog.waitFor({ state: 'hidden' });
  await loginDialog.waitFor({ state: 'hidden' });
};
