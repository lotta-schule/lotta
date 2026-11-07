import { APIRequestContext } from '@playwright/test';

/**
 * Sends a GraphQL request to the tenant's webapp, which proxies `/api` to core.
 * Uses the cookies of the given request context (e.g. `page.request` or
 * `context.request`), so it acts as the user logged in there.
 */
export const graphql = async <T = Record<string, unknown>>(
  request: APIRequestContext,
  baseURL: string,
  query: string,
  {
    variables = {},
    headers = {},
  }: {
    variables?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {}
) => {
  const response = await request.post(new URL('/api', baseURL).toString(), {
    data: { query, variables },
    headers,
  });

  return {
    status: response.status(),
    body: (await response.json().catch(() => null)) as {
      data?: T;
      errors?: unknown[];
    } | null,
  };
};

/** Returns the email of the user logged in in the given request context, or null */
export const getCurrentUserEmail = async (
  request: APIRequestContext,
  baseURL: string,
  headers: Record<string, string> = {}
) => {
  const { status, body } = await graphql<{
    currentUser: { email: string } | null;
  }>(request, baseURL, 'query { currentUser { email } }', { headers });

  if (status !== 200) {
    return null;
  }

  return body?.data?.currentUser?.email ?? null;
};
