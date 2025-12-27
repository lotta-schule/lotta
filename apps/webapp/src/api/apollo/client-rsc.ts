import { ApolloClient, ApolloLink } from '@apollo/client';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { createCache } from './cache';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createHttpLink } from './links/httpLink';
import { headers } from 'next/headers';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export const getAuthTokenFromHeader = (headerValues: ReadonlyHeaders) => {
  const authHeader = headerValues.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

export const createRSCClient = async () => {
  const headerValues = await headers();
  return new ApolloClient({
    cache: createCache(),

    link: ApolloLink.from([
      createErrorLink(),
      createAuthLink({
        initialToken: getAuthTokenFromHeader(headerValues) ?? undefined,
      }),
      createVariableInputMutationsLink(),
      createHttpLink({
        requestExtraHeaders: () => ({
          'x-lotta-originary-host': headerValues.get('host'),
          'user-agent': [
            process.env.npm_package_name,
            process.env.npm_package_version,
          ].join(' - '),
        }),
      }),
    ]),
    incrementalHandler: new Defer20220824Handler(),
  });
};
