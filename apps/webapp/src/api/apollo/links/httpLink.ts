import { createLink } from 'apollo-v3-absinthe-upload-link';
import { createCustomFetch } from '../customFetch.js';
import { appConfig } from '#/config.js';
import { isBrowser } from '#/util/isBrowser.js';

const API_URL = `${appConfig.get('API_URL')}/api`;

export const createHttpLink = ({
  requestExtraHeaders = () => ({}),
}: {
  requestExtraHeaders?: () => Record<string, string | null | undefined>;
} = {}) => {
  const opts = {
    uri: isBrowser() ? '/api' : (() => new URL('/api', API_URL).toString())(),
    fetch: createCustomFetch({ requestExtraHeaders }),
  };
  return createLink(opts);
};
