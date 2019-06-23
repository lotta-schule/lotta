import ApolloClient from 'apollo-boost';
import { get } from 'js-cookie';

export const client = new ApolloClient({
    uri: process.env.REACT_APP_API_URL,
    request: async operation => {
        const slug = window.location.host.split('.')[0];
        const jwtToken = get(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME);
        operation.setContext({
            headers: {
                tenant: `slug:${slug}`,
                ...(jwtToken ? {
                    Authorization: `Bearer ${jwtToken}`
                } : {})
            }
        })
    }
})