import axios from 'axios';
import { parseSetCookie } from 'cookie-es';
import { isBrowser } from 'util/isBrowser';
import { Logger } from 'util/logger';

export const sendRefreshRequest = async (
  tenant: { id: string } | { slug: string } | { host: string },
  token?: string,
  baseURL?: string
) => {
  try {
    const result = await axios.request<{
      accessToken: string;
    } | null>({
      method: 'post',
      baseURL,
      url: '/auth/token/refresh',
      withCredentials: isBrowser(),
      headers: {
        'x-lotta-originary-host': 'host' in tenant ? tenant.host : undefined,
        'x-lotta-tenant':
          'host' in tenant
            ? undefined
            : 'id' in tenant
              ? `id:${tenant.id}`
              : `slug:${tenant.slug}`,
      },
      data: { token },
    });
    const refreshToken = [result.headers['set-cookie']]
      .filter((h) => !!h)
      .flat()
      .flatMap((cookieHeader) => parseSetCookie(cookieHeader))
      ?.find((c) => c.name === 'SignInRefreshToken')?.value;
    const resultTenantIdentifier = result.headers['x-lotta-tenant'];
    return {
      accessToken: result.data?.accessToken || null,
      refreshToken,
      tenant:
        typeof resultTenantIdentifier === 'string' &&
        resultTenantIdentifier?.length
          ? resultTenantIdentifier
          : null,
    };
  } catch (e) {
    Logger.error('error getting an access token from refresh token', { e });
    return { accessToken: null, refreshToken: null, tenant: null };
  }
};
