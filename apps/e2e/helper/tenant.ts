import type { WorkerInfo } from '@playwright/test';

const adminUrl = `${process.env.CORE_URL}/admin/api`;

const username = process.env.ADMIN_USERNAME as string;
const password = process.env.ADMIN_PASSWORD as string;

type TenantInput = { title: string; slug: string };
type UserInput = { name: string; email: string; password?: string };

export type TenantAdmin = { name: string; email: string; password: string };

const basicAuth = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export type TenantDescriptor = {
  id: string;
  slug: string;
  title: string;
  state: 'init' | 'active' | 'readonly';
  insertedAt: string;
  updatedAt: string;
};

export const getTenantURL = ({ slug }: { slug: string }) => {
  const scheme = process.env.BASE_URI_SCHEME ?? 'http';
  const host = process.env.BASE_URI_HOST ?? 'local.lotta.schule';
  const port = process.env.BASE_URI_PORT ?? '3000';
  return `${scheme}://${slug}.${host}:${port}`;
};

/**
 * Creates a tenant via the core admin API.
 *
 * When `user.password` is given, the admin user gets this password and is not
 * forced to change it on first login.
 * When `sync` is true, the response only arrives once the default content is
 * created and the tenant is ready to use.
 */
export const createTenant = ({
  tenant,
  user,
  sync = false,
}: {
  tenant: TenantInput;
  user: UserInput;
  sync?: boolean;
}) =>
  fetch(`${adminUrl}/create-test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(username, password),
    },
    body: JSON.stringify({ tenant, user, sync }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error || res.errors) {
        throw new Error(JSON.stringify(res.error ?? res.errors));
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

/**
 * Creates a ready-to-use tenant with the given admin (known password, no forced
 * password change). No mail polling or browser interaction is needed.
 */
export const createTenantSetup = async (
  { admin }: { admin: TenantAdmin },
  { name, slug }: { name: string; slug: string }
) => {
  const tenant = await createTenant({
    tenant: { title: name, slug },
    user: admin,
    sync: true,
  });

  if (tenant.state !== 'active') {
    throw new Error(
      `Tenant ${slug} was created, but is not active (state: ${tenant.state})`
    );
  }

  return { tenant };
};

export const createTenantFixture =
  (getTenantData: (workerInfo: WorkerInfo) => { name: string; slug: string }) =>
  async (
    { admin }: { admin: TenantAdmin },
    use: (t: TenantDescriptor) => Promise<void>,
    workerInfo: WorkerInfo
  ) => {
    const { tenant } = await createTenantSetup(
      { admin },
      getTenantData(workerInfo)
    );

    await use(tenant);

    // make sure to clean up, or else restarting the test will fail
    await deleteTenant(tenant.id);
  };
