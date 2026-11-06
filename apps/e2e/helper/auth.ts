import { APIRequestContext, Page, expect } from '@playwright/test';

const LOGIN_MUTATION = `
  mutation Login($username: String, $password: String) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`;

/**
 * Logs in by sending the GraphQL `login` mutation to the tenant's webapp
 * (which proxies `/api` to core). The auth cookies are stored in the cookie jar
 * of the given request context, so passing `context.request` logs in the
 * whole browser context.
 */
export const loginViaApi = async (
  request: APIRequestContext,
  baseURL: string,
  user: { email: string; password: string }
) => {
  const response = await request.post(new URL('/api', baseURL).toString(), {
    data: {
      query: LOGIN_MUTATION,
      variables: { username: user.email, password: user.password },
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Login request for ${user.email} failed with status ${response.status()}`
    );
  }

  const body = await response.json();
  if (body.errors?.length || !body.data?.login?.accessToken) {
    throw new Error(
      `Login for ${user.email} failed: ${JSON.stringify(body.errors ?? body)}`
    );
  }
};

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

  if (isMobile) {
    await expect(
      page.getByRole('button', { name: /nutzermenü öffnen/i })
    ).toBeVisible();
    await page.getByRole('button', { name: /menü öffnen/i }).click();
    await expect(page.getByTestId('BaseLayoutSidebar')).toBeVisible();
  }

  const loginButton = page.getByRole('button', { name: /anmelden/i });
  await loginButton.click();

  const loginDialog = page.getByRole('dialog', { name: /anmelden/i });
  await expect(loginDialog).toBeVisible();

  await loginDialog.getByRole('textbox', { name: /e-mail/i }).fill(user.email);

  await loginDialog
    .getByRole('textbox', { name: /passwort/i })
    .fill(user.password);

  // await page.keyboard.press('Enter');
  await loginDialog.getByRole('button', { name: /anmelden/i }).click();

  await page.waitForURL((url) => url.hostname === new URL(baseURL).hostname);
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
