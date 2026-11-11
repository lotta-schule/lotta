import { Page } from '@playwright/test';
import { tenantTest } from '../fixtures';
import {
  createTenantFixture,
  getTenantURL,
  graphql,
  GraphqlClient,
  seedTenant,
} from '../helper';
import { recordVideo } from '../helper/docsCapture';
import { createSchool, School } from './school';

export * from '../fixtures';
export { capture } from '../helper/docsCapture';
export type { School } from './school';

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
  {
    /** The content of the school website (categories, articles, calendar …), created once per worker */
    school: School;
  }
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

  school: [
    async ({ playwright, tenant, users: _users, getAuthState }, use) => {
      const request = await playwright.request.newContext({
        storageState: await getAuthState('admin'),
      });
      const baseURL = getTenantURL(tenant);
      const gql: GraphqlClient = async (query, variables) => {
        const { status, body } = await graphql(request, baseURL, query, {
          variables,
        });
        if (status !== 200 || body?.errors?.length || !body?.data) {
          throw new Error(
            `GraphQL request for the docs school failed (${status}): ${JSON.stringify(body)}`
          );
        }
        return body.data as any;
      };
      const school = await createSchool(gql);
      await request.dispose();
      await use(school);
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

/**
 * Most docs screenshots are only shown in their desktop version: call this at
 * the top of a `describe` to skip it in the `docs-mobile` project.
 */
export const desktopOnly = () =>
  docsTest.skip(
    ({ isMobile }) => isMobile,
    'only the desktop version is used in the docs'
  );
