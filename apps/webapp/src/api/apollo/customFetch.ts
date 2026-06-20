import axios from 'axios';
import { appConfig } from '#/config';
import { isBrowser } from '#/util/isBrowser';

export const createHeaders = (headers: Record<string, string | null> = {}) => {
  const tenantSlugOverwrite = appConfig.get('FORCE_TENANT_SLUG');
  return Object.assign(
    {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    {
      'x-lotta-originary-host':
        headers['x-lotta-originary-host'] || headers.host,
    },
    tenantSlugOverwrite ? { tenant: `slug:${tenantSlugOverwrite}` } : {},
    { ...headers }
  );
};

/**
 * Optional keep-alive agents for server-side requests. Without them Node opens
 * a fresh TCP connection per request (~200ms `tcp.connect` per GraphQL call in
 * the staging traces). They are created server-side only (see `client-rsc.ts`)
 * so that `node:http`/`node:https` never end up in the browser bundle; axios
 * ignores them in the browser anyway.
 */
export type CustomFetchAgents = {
  httpAgent?: unknown;
  httpsAgent?: unknown;
};

export const createCustomFetch = (
  {
    requestExtraHeaders,
    agents,
  }: {
    requestExtraHeaders: () => Record<string, string | undefined | null>;
    agents?: CustomFetchAgents;
  } = {
    requestExtraHeaders: () => ({}),
  }
) =>
  (async (url: string, options: any) => {
    const { headers, body, method, ...miscOptions } = options;

    const outgoingHeaders = createHeaders({
      ...(body instanceof FormData
        ? { 'Content-Type': 'multipart/formdata' }
        : {}),
      ...headers,
      ...requestExtraHeaders(),
    });

    const axiosResponse = await axios({
      ...miscOptions,
      ...agents,
      headers: outgoingHeaders,
      url,
      method,
      data: body,
      withCredentials: isBrowser(),
    });
    return new Response(JSON.stringify(axiosResponse.data), {
      headers: Object.entries(axiosResponse.headers).map(([key, value]) => {
        return [key, Array.isArray(value) ? value.join(',') : value || ''] as [
          string,
          string,
        ];
      }),
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
    });
  }) as typeof fetch;
