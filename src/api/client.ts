import { createLink } from 'apollo-v3-absinthe-upload-link';
import { onError } from '@apollo/link-error';
import { ApolloClient, ApolloLink, InMemoryCache, gql } from '@apollo/client';
import axios, { AxiosRequestConfig } from 'axios';

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
                return forward ? forward(operation) : null;
            }
            return forward ? forward(operation) : null;
        }),
        createLink({
            uri: process.env.REACT_APP_API_URL,
            fetch: customFetch,
        })
    ]),
    resolvers: {},
    cache: new InMemoryCache(),
});

apolloClient.writeQuery({
    query: gql`{ isMobileDrawerOpen }`,
    data: { isMobileDrawerOpen: false }
});
apolloClient.onResetStore(async () => {
    apolloClient.writeQuery({
        query: gql`{ isMobileDrawerOpen }`,
        data: { isMobileDrawerOpen: false }
    });
});

export const client = apolloClient;