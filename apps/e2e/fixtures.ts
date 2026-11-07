import {
  test as base,
  BrowserContext,
  BrowserContextOptions,
  Locator,
  Page,
} from '@playwright/test';
import {
  createTenantFixture,
  getTenantURL,
  graphql,
  GraphqlClient,
  loginViaApi,
  saveScreenshot,
  SeedResult,
  seedTenant,
  TenantAdmin,
  TenantDescriptor,
} from './helper';

export * from '@playwright/test';

export type StorageState = Exclude<
  BrowserContextOptions['storageState'],
  string | undefined
>;

/**
 * A storage state without any session. Pass it to `browser.newContext()` for a
 * visitor: without it, a new context inherits `test.use({ loginAs })`'s session.
 */
export const GUEST_STATE: StorageState = { cookies: [], origins: [] };

export type Role = 'guest' | 'admin' | 'teacher' | 'student';

export type TenantUser = { name: string; email: string; password: string };

/**
 * In docker, file URLs point to the storage service as `minio:9100`, which is
 * not resolvable from the test runner: send those requests to localhost.
 */
const routeStorageToLocalhost = (context: BrowserContext) =>
  context.route('http://minio:9100/**', (route) =>
    route.continue({
      url: route
        .request()
        .url()
        .replace('http://minio:9100', 'http://localhost:9100'),
    })
  );

export const test = base.extend<
  { takeScreenshot: (name: string, target?: Page | Locator) => Promise<void> },
  {
    admin: TenantAdmin;
  }
>({
  context: async ({ context }, use) => {
    await routeStorageToLocalhost(context);
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
 * Every tenant has one user per role (`users.admin`, `users.teacher`,
 * `users.student`). Use `test.use({ loginAs: 'teacher' })` to start every test
 * already logged in as that user.
 *
 * Tests that change a user (password, email, …) should create their own user
 * with `seed()` instead of changing the shared ones.
 */
export const tenantTest = test.extend<
  {
    baseURL: string;
    loginAs: Role;
    seed: (input: Parameters<typeof seedTenant>[1]) => Promise<SeedResult>;
    /**
     * Opens a page in a new browser context with the given role's session
     * (or none, for 'guest'). Use it when a test needs several users at once.
     */
    openPageAs: (role: Role) => Promise<Page>;
    /** A GraphQL client acting as the given role, e.g. to create content as admin */
    graphqlAs: (role: Exclude<Role, 'guest'>) => Promise<GraphqlClient>;
  },
  {
    tenant: TenantDescriptor;
    users: Record<Exclude<Role, 'guest'>, TenantUser>;
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

  users: [
    async ({ tenant, admin }, use) => {
      const {
        users: [teacher, student],
      } = await seedTenant(tenant.id, {
        users: [
          {
            name: 'Gandalf der Graue',
            email: `gandalf-${tenant.slug}@e2e.lotta.schule`,
            password: 'you-shall-not-pass',
            groups: ['Lehrer'],
          },
          {
            name: 'Frodo Beutlin',
            email: `frodo-${tenant.slug}@e2e.lotta.schule`,
            password: 'my-precious',
            groups: ['Schüler'],
          },
        ],
      });
      await use({ admin, teacher, student });
    },
    { scope: 'worker' },
  ],

  // Log in once per worker and role, then reuse the cookies for every test.
  getAuthState: [
    async ({ browser, tenant, users }, use) => {
      const cache = new Map<string, Promise<StorageState>>();

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

  openPageAs: async ({ browser, getAuthState }, use) => {
    const contexts: BrowserContext[] = [];

    await use(async (role) => {
      const context = await browser.newContext({
        storageState: role === 'guest' ? GUEST_STATE : await getAuthState(role),
      });
      await routeStorageToLocalhost(context);
      contexts.push(context);
      return context.newPage();
    });

    await Promise.all(contexts.map((c) => c.close()));
  },

  graphqlAs: async ({ playwright, baseURL, getAuthState }, use) => {
    const contexts: { dispose: () => Promise<void> }[] = [];

    await use(async (role) => {
      const request = await playwright.request.newContext({
        storageState: await getAuthState(role),
      });
      contexts.push(request);

      return async (query, variables) => {
        const { status, body } = await graphql(request, baseURL, query, {
          variables,
        });
        if (status !== 200 || body?.errors?.length || !body?.data) {
          throw new Error(
            `GraphQL request as ${role} failed (${status}): ${JSON.stringify(body)}`
          );
        }
        return body.data as any;
      };
    });

    await Promise.all(contexts.map((c) => c.dispose()));
  },

  seed: async ({ tenant }, use) => {
    await use((input) => seedTenant(tenant.id, input));
  },

  baseURL: async ({ tenant }, use) => {
    await use(getTenantURL(tenant));
  },
});
