import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
    uri: process.env.REACT_APP_API_URL,
    request: async operation => {
        const slug = window.location.host.split('.')[0];
        operation.setContext({
            headers: {
                tenant: `slug:${slug}`
            }
        })
    }
})