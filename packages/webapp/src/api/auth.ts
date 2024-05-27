import axios from 'axios';
import { cookies } from 'next/headers';
import { createHeaders } from './apollo/customFetch';
import { isBrowser } from 'util/isBrowser';
import { appConfig } from 'config';

const getRefreshTokenFromServer = () => {
  return cookies().get('SignInRefreshToken')?.value?.trim() ?? null;
};

const getRefreshToken = () => {
  return isBrowser() ? null : getRefreshTokenFromServer();
};

export const sendRefreshRequest = async (
  token = getRefreshToken(),
  headers: Record<string, string | null> = {}
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const { data } = await axios
      .request<any>({
        method: 'post',
        baseURL: appConfig.get('API_URL'),
        url: '/auth/token/refresh',
        withCredentials: isBrowser(),
        headers: createHeaders({
          ...headers,
          Cookie: `SignInRefreshToken=${token}`,
        }),
      })
      .catch((e) => {
        console.log(e.response.data);
        throw e;
      });
    return data;
  } catch (e) {
    // TODO: Sentry
    console.error(e);
    return null;
  }
};
