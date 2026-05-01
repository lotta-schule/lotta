import { ApolloClient, ApolloLink } from '@apollo/client';
import { LocalState } from '@apollo/client/local-state';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { createCache } from './cache.js';
import { createErrorLink } from './links/errorLink.js';
import { createAuthLink } from './links/authLink.js';
import { createHttpLink } from './links/httpLink.js';
import { headers } from 'next/headers.js';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink.js';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers.js';

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
          'x-lotta-tenant': headerValues.get('x-lotta-tenant'),
          'x-lotta-originary-host':
            headerValues.get('x-lotta-originary-host') ||
            headerValues.get('x-forwarded-host') ||
            headerValues.get('host') ||
            undefined,
          'user-agent': [
            process.env.npm_package_name,
            process.env.npm_package_version,
          ].join(' - '),
        }),
      }),
    ]),

    incrementalHandler: new Defer20220824Handler(),

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@client` directive in your application,
    you can safely remove this option.
    */
    localState: new LocalState({}),
  });
};
