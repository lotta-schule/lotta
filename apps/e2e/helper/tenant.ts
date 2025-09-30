import { waitForSentMail } from './mail';
import { loginUserRequiringPWUpdate } from './auth';
import { Browser, expect } from '@playwright/test';

const adminUrl = `${process.env.CORE_URL}/admin-api`;

const username = process.env.ADMIN_USERNAME as string;
const password = process.env.ADMIN_PASSWORD as string;

type TenantInput = { title: string; slug: string };
type UserInput = { name: string; email: string };

const basicAuth = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export type TenantDescriptor = {
  id: string;
  slug: string;
  title: string;
  insertedAt: string;
  updatedAt: string;
};

export const createTenant = ({
  tenant,
  user,
}: {
  tenant: TenantInput;
  user: UserInput;
}) =>
  fetch(`${adminUrl}/create-test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(username, password),
    },
    body: JSON.stringify({ tenant, user }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        throw new Error(JSON.stringify(res.error));
      }
      if (res.success) {
        return res.tenant as TenantDescriptor;
      }
      throw new Error('Unexpected response: ' + JSON.stringify(res));
    });

export const deleteTenant = (tenantId: string) =>
  fetch(`${adminUrl}/delete-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(username, password),
    },
    body: JSON.stringify({ tenant: { id: tenantId } }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to delete tenant. Status Code: ' + res.status);
      }
      return res.json();
    })
    .then((res) => {
      if (res.error) {
        throw new Error(JSON.stringify(res.error));
      }
      if (res.success) {
        return res.tenant as TenantDescriptor;
      }
      throw new Error('Unexpected response');
    });

export const createTenantSetup = async (
  {
    browser,
    admin,
  }: {
    browser: Browser;
    admin: { name: string; email: string; password: string };
  },
  { name, slug }: { name: string; slug: string }
) => {
  // Use workerIndex as a unique identifier for each worker.

  const tenant = await createTenant({
    tenant: { title: name, slug },
    user: admin,
  });

  const matchingMail = await waitForSentMail(
    (mail) =>
      !!(
        mail.subject.includes(name) &&
        mail.to.find(([, mail]) => mail === admin.email)
      )
  );

  const mailText = matchingMail.text_body;
  const usernameMatcher = mailText.match(/Nutzername: (\S+)/);
  const passwordMatcher = mailText.match(/Passwort: (\S+)/);

  expect(usernameMatcher).not.toBeNull();
  expect(passwordMatcher).not.toBeNull();
  expect(usernameMatcher![1]).toBe(admin.email);

  const defaultPassword = passwordMatcher![1];

  const newBrowserContext = await browser.newContext();
  await newBrowserContext.storageState({
    path: `.auth/storage/${encodeURIComponent(admin.email)}`,
  });
  const page = await newBrowserContext.newPage();
  const isMobile = (page.viewportSize()?.width ?? 1000) < 768;

  await loginUserRequiringPWUpdate(
    {
      baseURL: `http://${slug}.local.lotta.schule:3000`,
      page,
      isMobile,
    },
    {
      email: admin.email,
      password: defaultPassword,
      newPassword: admin.password,
    }
  );

  return { tenant };
};

export const createTenantTeardown = async ({
  tenant,
}: {
  tenant: TenantDescriptor;
}) => {
  await deleteTenant(tenant.id); // make sure to clean up, or else restarting the test will fail
  // TODO: Reset mails by filter
  // await resetSentMails();
};

export const createTenantFixture =
  (getTenantData: () => { name: string; slug: string }) =>
  async (
    { admin, browser },
    use: (t: { name: string; slug: string; id: string }) => Promise<void>
  ) => {
    const { tenant } = await createTenantSetup(
      { browser, admin },
      getTenantData()
    );

    await use({ name: tenant.title, slug: tenant.slug, id: tenant.id });

    await createTenantTeardown({ tenant });
  };
