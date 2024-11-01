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
