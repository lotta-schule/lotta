import { ApolloClient, ApolloLink } from '@apollo/client';
import { LocalState } from '@apollo/client/local-state';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { cookies, headers } from 'next/headers.js';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers.js';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies.js';
import { createCache } from './cache';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createOtelLink } from './links/otelLink';
import { createHttpLink } from './links/httpLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';

export const getAuthTokenFromHeader = (
  headerValues: ReadonlyHeaders,
  cookieValues: ReadonlyRequestCookies
) => {
  const authHeader = headerValues.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const authCookie = cookieValues.get('SignInAccessToken');
  if (authCookie) {
    return authCookie.value;
  }

  return null;
};

export const createRSCClient = async () => {
  const headerValues = await headers();
  const cookieValues = await cookies();
  return new ApolloClient({
    cache: createCache(),

    link: ApolloLink.from([
      createOtelLink(),
      createErrorLink(),
      createAuthLink({
        initialToken:
          getAuthTokenFromHeader(headerValues, cookieValues) ?? undefined,
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
