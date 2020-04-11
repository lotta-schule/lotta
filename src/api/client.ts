import { InMemoryCache } from 'apollo-cache-inmemory';
import { createLink } from 'apollo-absinthe-upload-link';
import { ApolloLink, concat } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
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
    link: concat(
        new ApolloLink((operation, forward) => {
            if (operation.variables) {
                operation.variables = mutateVariableInputObject(operation.variables, '__typename');
                return forward ? forward(operation) : null;
            }
            return forward ? forward(operation) : null;
        },
        ),
        createLink({
            uri: process.env.REACT_APP_API_URL,
            fetch: customFetch,
        })
    ),
    resolvers: {},
    cache: new InMemoryCache({
        freezeResults: true
    })
});

const initialData = {
    isMobileDrawerOpen: false
}

apolloClient.writeData({ data: initialData });
apolloClient.onResetStore(async () => {
    apolloClient.writeData({ data: initialData })
});

export const client = apolloClient;