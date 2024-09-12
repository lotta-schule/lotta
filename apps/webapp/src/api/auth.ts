import * as Sentry from '@sentry/nextjs';
import { trace } from '@opentelemetry/api';
import axios from 'axios';
import { createHeaders } from './apollo/customFetch';
import { isBrowser } from 'util/isBrowser';
import { appConfig } from 'config';

export const sendRefreshRequest = (
  headers: Record<string, string | null> = {}
) =>
  trace
    .getTracer('lotta-web')
    .startActiveSpan('sendRefreshRequest', async () => {
      try {
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'trying to refresh token.',
          data: {
            headers,
            isBrowser: isBrowser(),
          },
        });
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
        Sentry.captureException(e);
        console.error(e);
        return null;
      }
    });
