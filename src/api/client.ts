import * as AbsintheSocket from '@absinthe/socket';
import { createLink } from 'apollo-v3-absinthe-upload-link';
import { onError } from '@apollo/link-error';
import {
    ApolloClient,
    ApolloLink,
    InMemoryCache,
    gql,
    split,
    NormalizedCacheObject,
} from '@apollo/client';
import { Socket as PhoenixSocket } from 'phoenix';
// @ts-ignore
import { hasSubscription } from '@jumpn/utils-graphql';
import { JWT } from 'util/auth/jwt';
import { isAfter, sub } from 'date-fns';
import axios, { AxiosRequestConfig } from 'axios';
import { createAbsintheSocketLink } from './createAbsintheSocketLink';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { socketUrl },
} = getConfig();

const isBrowser = typeof window !== 'undefined';

const sendRefreshRequest = async () => {
    try {
        const { data } = await axios.request<any>({
            method: 'post',
            baseURL: '/api/auth',
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
export const getApolloClient = () => {
    if (isBrowser) {
        if (cachedApolloClient !== null) {
            return cachedApolloClient;
        }
    }
    const customFetch = async (url: string, options: any) => {
        const { headers, body, method, ...miscOptions } = options;

        const config: AxiosRequestConfig = {
            ...miscOptions,
            headers,
            url,
            method,
            data: body,
            withCredentials: true,
        };

        const axiosResponse = await axios(config);
        return new Response(JSON.stringify(axiosResponse.data), {
            headers: new Headers(axiosResponse.headers),
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
        });
    };

    const mutateVariableInputObject = (obj: any, propToDelete: string): any => {
        if (obj instanceof Array) {
            return [
                ...obj.map((o) => mutateVariableInputObject(o, propToDelete)),
            ];
        } else if (
            obj !== null &&
            obj !== undefined &&
            typeof obj === 'object'
        ) {
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
                        [key]: mutateVariableInputObject(
                            obj[key],
                            propToDelete
                        ),
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
        if (isBrowser) {
            const token =
                operation.getContext().authToken ?? localStorage.getItem('id');
            if (token) {
                operation.setContext({
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        }
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
                          return { token, tid: window.tid };
                      } else {
                          return { tid: window.tid };
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
        cache: new InMemoryCache({}),
    });

    const writeDefaults = () => {
        apolloClient?.writeQuery({
            query: gql`
                {
                    isMobileDrawerOpen
                }
            `,
            data: { isMobileDrawerOpen: false },
        });
    };
    writeDefaults();
    apolloClient.onResetStore(async () => {
        writeDefaults();
    });
    if (isBrowser) {
        cachedApolloClient = apolloClient;
    }
    return apolloClient;
};
