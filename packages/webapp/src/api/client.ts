import * as AbsintheSocket from '@absinthe/socket';
import { onError } from '@apollo/link-error';
import {
  ApolloClient,
  ApolloLink,
  split,
  NormalizedCacheObject,
} from '@apollo/client';
import { createLink } from 'apollo-v3-absinthe-upload-link';
import { Socket as PhoenixSocket } from 'phoenix';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { hasSubscription } from '@jumpn/utils-graphql';
import { JWT } from 'util/auth/jwt';
import { TenantModel } from 'model';
import { isAfter, sub } from 'date-fns';
import { createAbsintheSocketLink } from './createAbsintheSocketLink';
import axios, { AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';
import { createCache } from './cache';

const ALLOWED_HEADERS = ['accept', 'content-type', 'authorization'] as const;

const {
  publicRuntimeConfig: { socketUrl, tenantSlugOverwrite },
} = getConfig();

const isBrowser = typeof window !== 'undefined';

const createHeaders = (headers?: any) => {
  if (!headers) {
    return headers;
  }
  return Object.assign(
    {},
    {
      'x-lotta-originary-host': headers.host,
    },
    Object.fromEntries(
      Object.entries(headers).filter(
        ([key]) =>
          key.startsWith('x-forwarded-') ||
          key.startsWith('x-real') ||
          ALLOWED_HEADERS.find((h) => h === key.toLowerCase())
      )
    ),
    tenantSlugOverwrite ? { tenant: `slug:${tenantSlugOverwrite}` } : {},
    isBrowser
      ? {}
      : {
          'user-agent': [
            process.env.npm_package_name,
            process.env.npm_package_version,
          ].join(' - '),
        }
  );
};

const sendRefreshRequest = async () => {
  try {
    const { data } = await axios.request<any>({
      method: 'post',
      baseURL: '/auth',
      url: 'token/refresh',
      withCredentials: true,
    });
    if (data?.accessToken) {
      localStorage.setItem('id', data.accessToken);
    } else {
      localStorage.clear();
    }
  } catch {
    localStorage.clear();
  }
};

export const checkExpiredToken = async () => {
  const accessToken = localStorage.getItem('id');
  if (accessToken) {
    try {
      const jwt = JWT.parse(accessToken);
      const now = new Date();

      if (isAfter(now, sub(new Date(jwt.body.expires), { minutes: 5 }))) {
        await sendRefreshRequest();
      }
    } catch (e) {
      localStorage.clear();
    }
  }
};

if (isBrowser) {
  checkExpiredToken();
}

let cachedApolloClient: ApolloClient<NormalizedCacheObject> | null = null;
export const getApolloClient = ({ tenant }: { tenant?: TenantModel } = {}) => {
  if (isBrowser) {
    if (cachedApolloClient !== null) {
      return cachedApolloClient;
    }
  }
  const customFetch = async (url: string, options: any) => {
    const { headers, body, method, ...miscOptions } = options;

    const config: AxiosRequestConfig = {
      ...miscOptions,
      headers: createHeaders(headers),
      url,
      method,
      data: body,
      withCredentials: true,
    };
    const axiosResponse = await axios(config);
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
  };

  const mutateVariableInputObject = (obj: any, propToDelete: string): any => {
    if (obj instanceof Array) {
      return [...obj.map((o) => mutateVariableInputObject(o, propToDelete))];
    } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
      return Object.keys(obj).reduce((newObj, key) => {
        if (
          (key === 'configuration' || key === 'customTheme') &&
          obj[key] &&
          typeof obj[key] === 'object' &&
          !obj[key]['__typename']
        ) {
          return {
            ...newObj,
            [key]: JSON.stringify(obj[key]),
          };
        }
        if (
          typeof obj[key] === 'object' &&
          !(isBrowser && obj[key] instanceof File)
        ) {
          return {
            ...newObj,
            [key]: mutateVariableInputObject(obj[key], propToDelete),
          };
        }
        if (key !== propToDelete) {
          return {
            ...newObj,
            [key]: obj[key],
          };
        }
        return {
          ...newObj,
        };
      }, {});
    }
    return obj;
  };

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const authLink = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = mutateVariableInputObject(
        operation.variables,
        '__typename'
      );
    }
    const headers: Record<string, string> = {};
    const token =
      operation.getContext().authToken ??
      (isBrowser && localStorage.getItem('id'));
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }
    operation.setContext(({ headers: currentHeaders = {} }) => ({
      headers: {
        ...currentHeaders,
        ...headers,
      },
    }));
    return forward?.(operation);
  });

  const httpLink = createLink({
    uri: isBrowser
      ? '/api/backend'
      : (() => {
          const url = new URL(process.env.API_URL);
          url.pathname = '/api';
          return url.toString();
        })(),
    fetch: customFetch,
  });

  const createAbsoluteSocketUrl = (urlString: string) => {
    if (/^\//.test(urlString)) {
      const url = new URL(window.location.href);
      url.protocol = url.protocol.replace('http', 'ws');
      url.pathname = urlString;
      return url.toString();
    }
    return urlString;
  };

  const phoenixSocket =
    isBrowser && socketUrl
      ? new PhoenixSocket(createAbsoluteSocketUrl(socketUrl), {
          params: () => {
            const token = localStorage.getItem('id');
            if (token) {
              return { token, tid: tenant?.id };
            } else {
              return { tid: tenant?.id };
            }
          },
        })
      : null;

  const absintheSocket = phoenixSocket
    ? AbsintheSocket.create(phoenixSocket)
    : null;

  const websocketLink = absintheSocket
    ? createAbsintheSocketLink(absintheSocket)
    : null;

  const link = websocketLink
    ? split(
        (operation) => hasSubscription(operation.query),
        ApolloLink.from([errorLink, websocketLink]),
        ApolloLink.from([errorLink, authLink, httpLink])
      )
    : ApolloLink.from([errorLink, authLink, httpLink]);

  const apolloClient = new ApolloClient({
    ssrMode: !isBrowser,
    link,
    resolvers: {},
    cache: createCache(),
  });

  if (isBrowser) {
    cachedApolloClient = apolloClient;
  }
  return apolloClient;
};
