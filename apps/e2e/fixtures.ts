import { test as base } from '@playwright/test';
import { createTenantFixture } from './helper';

export * from '@playwright/test';

export const test = base.extend<
  object,
  {
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
