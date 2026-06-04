import { parseSetCookie } from 'cookie-es';
import { isBrowser } from '#/util/isBrowser.js';
import { Logger } from '#/util/logger.js';
import { JWT } from '../util/auth/jwt.js';

const tryParseJWT = (token: string): JWT | null => {
  try {
    return JWT.parse(token);
  } catch {
    return null;
  }
};

export const sendRefreshRequest = async (
  accessToken?: string | null,
  refreshToken?: string | null,
  { baseURL, originaryHost }: { baseURL?: string; originaryHost?: string } = {}
) => {
  // Extract tenantId from the access token JWT — parseable even if expired, no signature needed.
  const tenantId = accessToken ? tryParseJWT(accessToken)?.body.tenantId : null;

  const tenantHeaders: Record<string, string> = tenantId
    ? { 'x-lotta-tenant': `id:${tenantId}` }
    : originaryHost
      ? { 'x-lotta-originary-host': originaryHost }
      : {};

  const url = baseURL
    ? new URL('/auth/token/refresh', baseURL).toString()
    : '/auth/token/refresh';

  try {
    const response = await fetch(url, {
      method: 'POST',
      // In the browser, cookies are sent automatically via credentials: 'include'.
      // In SSR (Node.js), credentials are irrelevant; the refresh token is passed in the body.
      credentials: isBrowser() ? 'include' : 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...tenantHeaders,
      },
      // Send refresh token in body when available (SSR always has it; browser may rely on cookie).
      // Server reads params["token"] || params["refreshToken"] || cookie.
      body: refreshToken ? JSON.stringify({ token: refreshToken }) : undefined,
    });

    if (!response.ok) {
      Logger.error('refresh request failed', { status: response.status });
      return { accessToken: null, refreshToken: null, tenant: null };
    }

    const data = (await response.json()) as { accessToken?: string } | null;

    const setCookieHeader = response.headers.get('set-cookie');
    const newRefreshToken = setCookieHeader
      ? ([setCookieHeader]
          .flat()
          .flatMap((h) => parseSetCookie(h))
          .find((c) => c?.name === 'SignInRefreshToken')?.value ?? null)
      : null;

    const resultTenantIdentifier = response.headers.get('x-lotta-tenant');

    if (!data?.accessToken || !newRefreshToken) {
      Logger.error('tokens not found in refresh response', {
        accessToken: data?.accessToken,
        hasRefreshToken: !!newRefreshToken,
      });
      return { accessToken: null, refreshToken: null, tenant: null };
    }

    return {
      accessToken: data.accessToken,
      refreshToken: newRefreshToken,
      tenant:
        typeof resultTenantIdentifier === 'string' &&
        resultTenantIdentifier.length
          ? resultTenantIdentifier
          : null,
    };
  } catch (e) {
    Logger.error('error getting an access token from refresh token', { e });
    return { accessToken: null, refreshToken: null, tenant: null };
  }
};
