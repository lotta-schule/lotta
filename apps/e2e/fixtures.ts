import { test as base, expect, Page } from '@playwright/test';
import {
  createTenant,
  deleteTenant,
  getSentMails,
  resetSentMails,
} from './helper';

export * from '@playwright/test';

export const test = base.extend<
  { baseURL: string },
  {
    tenant: { name: string; slug: string; id: string };
    admin: { name: string; email: string; password: string };
  }
>({
  admin: [
    {
      name: 'Bilbo Baggins',
      email: 'bilbo.baggins@shite.me',
      password: 'prec10us',
    },
    { scope: 'worker', option: true },
  ],
  // Returns db user name unique for the worker.
  tenant: [
    async ({ admin, browser }, use) => {
      // Use workerIndex as a unique identifier for each worker.
      const name = `Example Lotta Worker n°${test.info().workerIndex}`;
      const slug = `my-lotta-worker-${test.info().workerIndex}`;

      const tenant = await createTenant({
        tenant: { title: name, slug },
        user: admin,
      });

      const defaultPassword = await getSentMails().then((mails) => {
        const matchingMails = mails.filter((mail) =>
          mail.subject.includes(name)
        );
        expect(matchingMails).toHaveLength(1);

        const mailText = matchingMails[0].text_body;
        const usernameMatcher = mailText.match(/Nutzername: (\S+)/);
        const passwordMatcher = mailText.match(/Passwort: (\S+)/);

        expect(usernameMatcher).not.toBeNull();
        expect(passwordMatcher).not.toBeNull();
        expect(usernameMatcher![1]).toBe(admin.email);

        return passwordMatcher![1];
      });

      const newBrowserContext = await browser.newContext();
      await updatePasswordOnFirstLogin({
        baseURL: `http://${slug}.local.lotta.schule:3000`,
        page: await newBrowserContext.newPage(),
        user: {
          email: admin.email,
          password: defaultPassword,
          newPassword: admin.password,
        },
      });

      await use({ name, slug, id: tenant.id });

      await deleteTenant(tenant.id); // make sure to clean up, or else restarting the test will fail
      await resetSentMails();
    },
    { scope: 'worker', timeout: 10_000 },
  ],
  baseURL: [
    async ({ tenant }, use: (t: string) => Promise<void>) => {
      await use(`http://${tenant.slug}.local.lotta.schule:3000`);
    },
    { scope: 'test' },
  ],
});

const updatePasswordOnFirstLogin = async ({
  baseURL,
  page,
  user,
}: {
  baseURL: string;
  page: Page;
  user: { email: string; password: string; newPassword: string };
}) => {
  const isMobile = (page.viewportSize()?.width ?? 1000) < 768;

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

  await loginDialog.getByRole('textbox', { name: /email/i }).fill(user.email);

  await loginDialog
    .getByRole('textbox', { name: /passwort/i })
    .fill(user.password);

  // await page.keyboard.press('Enter');
  await loginDialog.getByRole('button', { name: /anmelden/i }).click();

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

  expect(page.getByRole('button', { name: /Mein Profil/i })).toBeVisible();
};
