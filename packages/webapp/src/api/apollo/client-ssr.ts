'use client';

import { ApolloLink, createHttpLink } from '@apollo/client';
import {
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { createWebsocketLink } from './links/websocketLink';
import { TenantModel } from 'model';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';

export const createSSRClient = (tenant: TenantModel) => {
  const networkLink =
    typeof window === 'undefined'
      ? createHttpLink()
      : (createWebsocketLink(tenant) as any);

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link: ApolloLink.from(
      [
        createErrorLink(),
        createAuthLink({
          requestToken: async () => localStorage.getItem('id'),
        }),
        // in a SSR environment, if you use multipart features like
        // @defer, you need to decide how to handle these.
        // This strips all interfaces with a `@defer` directive from your queries.
        new SSRMultipartLink({
          stripDefer: true,
        }),
        createVariableInputMutationsLink(),
        networkLink,
      ].filter(Boolean)
    ),
  });
};
