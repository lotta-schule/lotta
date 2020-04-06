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
    for (const property in obj) {
        if (property === 'configuration' && typeof obj[property] === 'object') {
            delete obj.property;
            obj[property] = JSON.stringify(obj[property]);
        } else if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
            delete obj.property;
            const newData = mutateVariableInputObject(obj[property], propToDelete);
            obj[property] = newData;
        } else {
            if (property === propToDelete) {
                delete obj[property];
            }
        }
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