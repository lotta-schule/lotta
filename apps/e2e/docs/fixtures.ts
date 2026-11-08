import { Page } from '@playwright/test';
import { tenantTest } from '../fixtures';
import { createTenantFixture, seedTenant } from '../helper';
import { recordVideo } from '../helper/docsCapture';

export * from '../fixtures';
export { capture } from '../helper/docsCapture';

/**
 * Like `tenantTest`, with content that reads well in the documentation: a
 * school name instead of "Example Lotta Worker n°3", and users with fixed names
 * and emails, so screenshots are the same on every run.
 */
export const docsTest = tenantTest.extend<
  {
    /**
     * Records `flow` as `apps/docs/src/assets/videos/<name>.webm`, in a new
     * context with the same device settings as the test and the given role's
     * session.
     */
    recordVideo: (
      name: string,
      options: { as: 'guest' | 'admin' | 'teacher' | 'student' },
      flow: (page: Page) => Promise<void>
    ) => Promise<string>;
  },
  {}
>({
  admin: [
    {
      name: 'Maria Lehmann',
      email: 'maria.lehmann@lotta-gymnasium.de',
      password: 'docs-admin-password',
    },
    { scope: 'worker' },
  ],

  tenant: [
    createTenantFixture(({ workerIndex }) => ({
      name: 'Lotta-Gymnasium',
      slug: `e2e-docs-${workerIndex}-${Date.now().toString(36)}`,
    })),
    { scope: 'worker' },
  ],

  users: [
    async ({ tenant, admin }, use) => {
      const {
        users: [teacher, student],
      } = await seedTenant(tenant.id, {
        users: [
          {
            name: 'Thomas Krüger',
            email: 'thomas.krueger@lotta-gymnasium.de',
            password: 'docs-teacher-password',
            groups: ['Lehrer'],
          },
          {
            name: 'Lena Schröder',
            email: 'lena.schroeder@lotta-gymnasium.de',
            password: 'docs-student-password',
            class: '7b',
            groups: ['Schüler'],
          },
        ],
      });
      await use({ admin, teacher, student });
    },
    { scope: 'worker' },
  ],

  recordVideo: async (
    {
      browser,
      baseURL,
      getAuthState,
      viewport,
      isMobile,
      hasTouch,
      deviceScaleFactor,
      userAgent,
      locale,
      timezoneId,
      colorScheme,
    },
    use
  ) => {
    await use(async (name, { as }, flow) =>
      recordVideo(
        browser,
        name,
        {
          baseURL,
          storageState:
            as === 'guest'
              ? { cookies: [], origins: [] }
              : await getAuthState(as),
          viewport,
          isMobile,
          hasTouch,
          deviceScaleFactor,
          userAgent,
          locale,
          timezoneId,
          colorScheme,
        },
        flow
      )
    );
  },
});
