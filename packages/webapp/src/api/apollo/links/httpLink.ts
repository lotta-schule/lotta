import { createLink } from 'apollo-v3-absinthe-upload-link';
import { createCustomFetch } from '../customFetch';
import { appConfig } from 'config';

const isBrowser = typeof window !== 'undefined';

const API_URL = `${appConfig.get('API_URL')}/api`;

export const createHttpLink = ({
  requestExtraHeaders = () => ({}),
}: {
  requestExtraHeaders?: () => Record<string, string | null | undefined>;
} = {}) => {
  const opts = {
    uri: isBrowser
      ? '/api/backend'
      : (() => {
          const url = new URL(API_URL);
          url.pathname = '/api';
          return url.toString();
        })(),
    fetch: createCustomFetch({ requestExtraHeaders }),
  };
  return createLink(opts);
};
