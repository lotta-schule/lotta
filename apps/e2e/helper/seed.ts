const adminUrl = `${process.env.CORE_URL}/admin/api`;

const basicAuth = () =>
  `Basic ${Buffer.from(
    `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
  ).toString('base64')}`;

export type SeedGroupInput = {
  name: string;
  isAdminGroup?: boolean;
  enrollmentTokens?: string[];
};

export type SeedUserInput = {
  name: string;
  email: string;
  /**
   * If omitted, the user gets a generated first-time password (returned in the
   * result) and has to change it on first login.
   */
  password?: string;
  nickname?: string;
  class?: string;
  /** Group names, e.g. the default groups 'Lehrer', 'Schüler' or 'Administrator' */
  groups?: string[];
};

export type SeededUser = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type SeedResult = {
  groups: { id: number; name: string }[];
  users: SeededUser[];
};

/**
 * Creates groups and users in a tenant via the core e2e API
 * (requires ENABLE_E2E_API on the core service).
 */
export const seedTenant = async (
  tenantId: string | number,
  {
    groups = [],
    users = [],
  }: { groups?: SeedGroupInput[]; users?: SeedUserInput[] }
): Promise<SeedResult> => {
  const res = await fetch(`${adminUrl}/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(),
    },
    body: JSON.stringify({ tenant: { id: tenantId }, groups, users }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(
      `Seeding tenant ${tenantId} failed (status ${res.status}): ${JSON.stringify(body)}`
    );
  }

  return { groups: body.groups, users: body.users };
};

/** A unique email address, so tests can find "their" mails in the shared mailbox */
export const uniqueEmail = (name: string) =>
  `${name}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@e2e.lotta.schule`;
