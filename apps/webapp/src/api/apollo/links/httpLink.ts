import { createLink } from 'apollo-v3-absinthe-upload-link';
import { createCustomFetch } from '../customFetch';
import { appConfig } from 'config';
import { isBrowser } from 'util/isBrowser';

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
