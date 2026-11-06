import {
  test as base,
  BrowserContextOptions,
  Locator,
  Page,
} from '@playwright/test';
import {
  createTenantFixture,
  getTenantURL,
  loginViaApi,
  saveScreenshot,
  TenantAdmin,
  TenantDescriptor,
} from './helper';

export * from '@playwright/test';

type StorageState = Exclude<
  BrowserContextOptions['storageState'],
  string | undefined
>;

export type Role = 'guest' | 'admin';

export const test = base.extend<
  { takeScreenshot: (name: string, target?: Page | Locator) => Promise<void> },
  {
    admin: TenantAdmin;
  }
>({
  context: async ({ context }, use) => {
    await context.route('http://minio:9100/**', (route) =>
      route.continue({
        url: route
          .request()
          .url()
          .replace('http://minio:9100', 'http://localhost:9100'),
      })
    );
    await use(context);
  },
  takeScreenshot: async ({ browserName, isMobile, page }, use) => {
    const fullBrowserName = isMobile ? `${browserName}-mobile` : browserName;
    await use(
      async (name: string, target: Page | Locator | undefined = page) => {
        const screenshot = await target.screenshot();
        await saveScreenshot(screenshot, name, fullBrowserName);
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

/**
 * Tests running in a tenant of their own.
 *
 * Every worker gets a fresh tenant (= its own database schema), which is
 * deleted when the worker shuts down. Tests in the same worker share the
 * tenant, so they must not rely on state that other tests may change
 * (e.g. the tenant's title).
 *
 * Use `test.use({ loginAs: 'admin' })` to start every test already logged in.
 */
export const tenantTest = test.extend<
  { baseURL: string; loginAs: Role },
  {
    tenant: TenantDescriptor;
    getAuthState: (role: Exclude<Role, 'guest'>) => Promise<StorageState>;
  }
>({
  tenant: [
    createTenantFixture(({ workerIndex, parallelIndex }) => {
      const uniqueId = `${workerIndex}-${Date.now().toString(36)}`;
      return {
        name: `Example Lotta Worker n°${parallelIndex}`,
        slug: `e2e-worker-${uniqueId}`,
      };
    }),
    { scope: 'worker' },
  ],

  // Log in once per worker and role, then reuse the cookies for every test.
  getAuthState: [
    async ({ browser, tenant, admin }, use) => {
      const cache = new Map<string, Promise<StorageState>>();
      const users = { admin };

      await use((role) => {
        if (!cache.has(role)) {
          cache.set(
            role,
            (async () => {
              const context = await browser.newContext();
              try {
                await loginViaApi(
                  context.request,
                  getTenantURL(tenant),
                  users[role]
                );
                return await context.storageState();
              } finally {
                await context.close();
              }
            })()
          );
        }
        return cache.get(role)!;
      });
    },
    { scope: 'worker' },
  ],

  loginAs: ['guest', { option: true }],

  storageState: async ({ loginAs, getAuthState }, use) => {
    await use(loginAs === 'guest' ? undefined : await getAuthState(loginAs));
  },

  baseURL: async ({ tenant }, use) => {
    await use(getTenantURL(tenant));
  },
});
