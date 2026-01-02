import axios from 'axios';
import { createHeaders } from './apollo/customFetch';
import { isBrowser } from 'util/isBrowser';
import { appConfig } from 'config';

export const sendRefreshRequest = async (
  headers: Record<string, string | null> = {}
) => {
  try {
    const { data } = await axios.request<{
      accessToken: string;
      refreshToken: string;
    } | null>({
      method: 'post',
      baseURL: isBrowser() ? '/' : appConfig.get('API_URL'),
      url: '/auth/token/refresh',
      withCredentials: isBrowser(),
      headers: createHeaders(headers),
    });
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
