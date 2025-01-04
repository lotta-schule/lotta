import { test as base, Locator, Page } from '@playwright/test';
import { createTenantFixture, saveScreenshot } from './helper';

export * from '@playwright/test';

export const test = base.extend<
  { takeScreenshot: (name: string, target?: Page | Locator) => Promise<void> },
  {
    admin: { name: string; email: string; password: string };
  }
>({
  takeScreenshot: async ({ browserName, page }, use) => {
    await use(
      async (name: string, target: Page | Locator | undefined = page) => {
        const screenshot = await target.screenshot();
        await saveScreenshot(screenshot, name, browserName);
      }
    );
  },
  admin: [
    {
      name: 'Bilbo Baggins',
      email: 'bilbo.baggins@shire.me',
      password: 'prec10us',
    },
    { scope: 'worker', option: true },
  ],
});

export const tenantTest = test.extend<
  { baseURL: string },
  {
    tenant: { name: string; slug: string; id: string };
  }
>({
  // Returns db user name unique for the worker.
  tenant: [
    createTenantFixture(() => ({
      name: `Example Lotta Worker n°${test.info().workerIndex}`,
      slug: `my-lotta-worker-${test.info().workerIndex}`,
    })),
    { scope: 'worker' },
  ],
  baseURL: [
    async ({ tenant }, use: (t: string) => Promise<void>) => {
      await use(`http://${tenant.slug}.local.lotta.schule:3000`);
    },
    { scope: 'test' },
  ],
});
