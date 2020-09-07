import { createLink } from 'apollo-v3-absinthe-upload-link';
import { onError } from '@apollo/link-error';
import { ApolloClient, ApolloLink, InMemoryCache, gql } from '@apollo/client';
import { JWT } from 'util/auth/jwt';
import { isAfter, sub } from 'date-fns';
import axios, { AxiosRequestConfig } from 'axios';

const sendRefreshRequest = async () => {
    try {
        const { data } = await axios({
            method: 'post',
            baseURL: process.env.REACT_APP_AUTH_URL!,
            url: '/token/refresh',
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

export const checkExpiredToken = async (firstRun: boolean = false) => {
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
    } else if (firstRun) {
        // when there are no tokens in localstorage, have a try refreshing,
        // there may be a refresh token saved as HTTPOnly Cookie
        await sendRefreshRequest();
    }
};

const customFetch = (url: string, options: any) => {
    const { headers, body, method, ...miscOptions } = options;

    const config: AxiosRequestConfig = {
        ...miscOptions,
        headers,
        url,
        method,
        data: body,
        withCredentials: true,
    };

    return axios(config).then(axiosResponse => {
        return new Response(JSON.stringify(axiosResponse.data), {
            headers: new Headers(axiosResponse.headers),
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
        });
    });
};

const mutateVariableInputObject = (obj: any, propToDelete: string): any => {
    if (obj instanceof Array) {
        return [...obj.map(o => mutateVariableInputObject(o, propToDelete))];
    } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
        return Object.keys(obj).reduce((newObj, key) => {
            if (key === 'configuration' && typeof obj[key] === 'object') {
                return {
                    ...newObj,
                    [key]: JSON.stringify(obj[key])
                };
            }
            if (typeof obj[key] === 'object' && !(obj[key] instanceof File)) {
                return {
                    ...newObj,
                    [key]: mutateVariableInputObject(obj[key], propToDelete)
                };
            }
            if (key !== propToDelete) {
                return {
                    ...newObj,
                    [key]: obj[key]
                };
            }
            return {
                ...newObj
            };
        }, {});
    }
    return obj;
};

const apolloClient = new ApolloClient({
    link: ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
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
        }),
        new ApolloLink((operation, forward) => {
            if (operation.variables) {
                operation.variables = mutateVariableInputObject(operation.variables, '__typename');
            }
            const token = localStorage.getItem('id');
            if (token) {
                operation.setContext({
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            return forward ? forward(operation) : null;
        }),
        createLink({
            uri: process.env.REACT_APP_API_URL,
            fetch: customFetch,
        })
    ]),
    resolvers: {},
    cache: new InMemoryCache({
        typePolicies: {
            System: {
                keyFields: ['title']
            }
        }
    }),
});

const writeDefaults = () => {
    apolloClient.writeQuery({
        query: gql`{ isMobileDrawerOpen }`,
        data: { isMobileDrawerOpen: false }
    });
};
writeDefaults();
apolloClient.onResetStore(async () => {
    writeDefaults();
});

export const client = apolloClient;
