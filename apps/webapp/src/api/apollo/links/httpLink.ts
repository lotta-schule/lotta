import { createLink } from 'apollo-v3-absinthe-upload-link';
import { createCustomFetch, CustomFetchAgents } from '../customFetch';
import { appConfig } from '#/config';
import { isBrowser } from '#/util/isBrowser';

const API_URL = `${appConfig.get('API_URL')}/api`;

export const createHttpLink = ({
  requestExtraHeaders = () => ({}),
  agents,
}: {
  requestExtraHeaders?: () => Record<string, string | null | undefined>;
  agents?: CustomFetchAgents;
} = {}) => {
  const opts = {
    uri: isBrowser() ? '/api' : (() => new URL('/api', API_URL).toString())(),
    fetch: createCustomFetch({ requestExtraHeaders, agents }),
  };
  return createLink(opts);
};
