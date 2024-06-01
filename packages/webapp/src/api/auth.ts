import axios from 'axios';
import { createHeaders } from './apollo/customFetch';
import { isBrowser } from 'util/isBrowser';
import { appConfig } from 'config';

export const sendRefreshRequest = async (
  headers: Record<string, string | null> = {}
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const { data } = await axios
      .request<any>({
        method: 'post',
        baseURL: isBrowser() ? '/' : appConfig.get('API_URL'),
        url: '/auth/token/refresh',
        withCredentials: isBrowser(),
        headers: createHeaders(headers),
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
