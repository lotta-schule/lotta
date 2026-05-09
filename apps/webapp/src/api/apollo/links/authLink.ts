import { ApolloLink } from '@apollo/client';

type AuthLinkParams = {
  initialToken?: string;
  authToken?: string;
};

export const createAuthLink = ({ initialToken }: AuthLinkParams) =>
  new ApolloLink((operation, forward) => {
    if (initialToken) {
      operation.setContext(({ headers = {}, authToken = undefined }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${authToken || initialToken}`,
        },
        accessToken: authToken || initialToken,
      }));
    }

    return forward(operation);
  });
