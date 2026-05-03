import axios from 'axios';
import { parseSetCookie } from 'cookie-es';
import { isBrowser } from '#/util/isBrowser.js';
import { Logger } from '#/util/logger.js';
import { JWT, JWTBody } from '../util/auth/jwt.js';

export const sendRefreshRequest = async (
  accessToken?: string,
  refreshToken?: string,
  { baseURL, originaryHost }: { baseURL?: string; originaryHost?: string } = {}
) => {
  const jwt = accessToken ? JWT.parse(accessToken) : undefined;
  const payload = jwt?.body as JWTBody & { tid: string };
  const tenant = { id: payload?.tid };

  if (!tenant.id) {
    Logger.error('tenant id not found in access token');
    return { accessToken: null, refreshToken: null, tenant: null };
  }

  try {
    const result = await axios.request<{
      accessToken: string;
      refreshToken: string;
    } | null>({
      method: 'post',
      baseURL,
      url: '/auth/token/refresh',
      withCredentials: isBrowser(),
      headers: {
        'x-originary-host': originaryHost,
        'x-lotta-tenant': `id:${tenant.id}`,
      },
      data: { accessToken, refreshToken },
    });
    const newRefreshToken = [result.headers['set-cookie']]
      .filter((h) => !!h)
      .flat()
      .flatMap((cookieHeader) => parseSetCookie(cookieHeader))
      ?.find((c) => c?.name === 'SignInRefreshToken')?.value;

    const resultTenantIdentifier = result.headers['x-lotta-tenant'];

    if (!result.data?.accessToken || !newRefreshToken) {
      Logger.error(
        'access token or refresh token not found in refresh response',
        {
          accessToken: result.data?.accessToken,
          refreshToken: newRefreshToken,
        }
      );
      return { accessToken: null, refreshToken: null, tenant: null };
    }

    return {
      accessToken: result.data?.accessToken,
      refreshToken: newRefreshToken,
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
