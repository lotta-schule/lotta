import { expect, tenantTest as test } from '../fixtures';
import {
  createTenantSetup,
  deleteTenant,
  getCurrentUserEmail,
  getTenantURL,
  loginViaApi,
  TenantDescriptor,
} from '../helper';

/**
 * Every tenant is a separate school. Nothing from one tenant may be accessible
 * from another one, even though they run on the same servers and database.
 */
test.describe('Tenant isolation', () => {
  let otherTenant: TenantDescriptor;

  test.beforeAll(async ({ admin }, workerInfo) => {
    const id = `${workerInfo.workerIndex}-${Date.now().toString(36)}`;
    ({ tenant: otherTenant } = await createTenantSetup(
      { admin },
      { name: `Other Lotta ${id}`, slug: `e2e-other-${id}` }
    ));
  });

  test.afterAll(async () => {
    if (otherTenant) {
      await deleteTenant(otherTenant.id);
    }
  });

  test(
    'a user of one tenant cannot log in on another tenant',
    { tag: '@smoke' },
    async ({ playwright, baseURL, users }) => {
      const request = await playwright.request.newContext();

      // works on the user's own tenant …
      await loginViaApi(request, baseURL, users.student);
      expect(await getCurrentUserEmail(request, baseURL)).toBe(
        users.student.email
      );

      // … but the same credentials are unknown on the other tenant
      await expect(
        loginViaApi(request, getTenantURL(otherTenant), users.student)
      ).rejects.toThrow();

      await request.dispose();
    }
  );

  test(
    'a session of one tenant is not valid on another tenant',
    { tag: '@smoke' },
    async ({ playwright, baseURL, users }) => {
      const request = await playwright.request.newContext();
      await loginViaApi(request, baseURL, users.admin);

      const { cookies } = await request.storageState();
      const accessToken = cookies.find(
        (cookie) => cookie.name === 'SignInAccessToken'
      )?.value;
      expect(accessToken, 'access token cookie after login').toBeTruthy();

      // The admin user exists (with the same email) in both tenants, so this
      // makes sure the token itself is bound to the tenant it was issued for.
      const otherTenantURL = getTenantURL(otherTenant);
      for (const headers of <Record<string, string>[]>[
        { Cookie: `SignInAccessToken=${accessToken}` },
        { Authorization: `Bearer ${accessToken}` },
      ]) {
        const otherRequest = await playwright.request.newContext();
        expect(
          await getCurrentUserEmail(otherRequest, otherTenantURL, headers),
          `currentUser on other tenant with ${Object.keys(headers)[0]} header`
        ).toBeNull();
        await otherRequest.dispose();
      }

      await request.dispose();
    }
  );
});
