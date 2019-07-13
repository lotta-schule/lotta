import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createLink } from 'apollo-absinthe-upload-link';
import { get } from 'js-cookie';
import axios, { AxiosRequestConfig } from 'axios';

const customFetch = (url: string, options: any) => {
    const slug = window.location.host.split('.')[0];
    const jwtToken = get(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME);

    const { headers, body, method, ...miscOptions } = options;

    const config: AxiosRequestConfig = {
        ...miscOptions,
        headers: {
            ...headers,
            tenant: `slug:${slug}`,
            ...(jwtToken ? {
                Authorization: `Bearer ${jwtToken}`
            } : {})
        },
        url,
        method,
        data: body,
    };

    console.log('send axios request with config: ', config);

    return axios(config).then(axiosResponse => {
        // debugger;
        return new Response(JSON.stringify(axiosResponse.data), {
            headers: new Headers(axiosResponse.headers),
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
        });
    });
};

export const client = new ApolloClient({
    link: createLink({
        uri: process.env.REACT_APP_API_URL,
        fetch: customFetch
    }),
    cache: new InMemoryCache()
});