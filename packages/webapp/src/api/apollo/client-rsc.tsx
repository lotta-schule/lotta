import { ApolloClient, ApolloLink } from '@apollo/client';
import { createCache } from './cache';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createHttpLink } from './links/httpLink';
import { headers } from 'next/headers';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';

export const createRSCClient = () => {
  return new ApolloClient({
    cache: createCache(),
    link: ApolloLink.from([
      createErrorLink(),
      createAuthLink({
        requestToken: async () => {
          const authHeader = headers().get('authorization');
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.slice(7);
          }

          return null;
        },
      }),
      createVariableInputMutationsLink(),
      createHttpLink({
        requestExtraHeaders: () => ({
          'x-lotta-originary-host': headers().get('host'),
          'user-agent': [
            process.env.npm_package_name,
            process.env.npm_package_version,
          ].join(' - '),
        }),
      }),
    ]),
  });
};
