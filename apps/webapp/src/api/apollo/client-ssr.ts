'use client';

import { ApolloLink, split } from '@apollo/client';
import {
  InMemoryCache,
  ApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';
import { createWebsocketLink } from './links/websocketLink';
import { TenantModel } from 'model';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createHttpLink } from './links/httpLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';
import { getMainDefinition } from '@apollo/client/utilities';

export const createSSRClient = (
  tenant: Pick<TenantModel, 'id'>,
  socketUrl?: string | null,
  accessToken?: string
) => {
  const websocketLink = createWebsocketLink(tenant, socketUrl, accessToken);
  const httpLink = createHttpLink({
    requestExtraHeaders: () => ({
      tenant: `id:${tenant.id}`,
    }),
  });
  const networkLink = websocketLink
    ? split(
        (operation) => {
          const definition = getMainDefinition(operation.query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },

        websocketLink as any as ApolloLink,
        httpLink
      )
    : httpLink;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from(
      [
        createErrorLink(),
        createAuthLink({
          initialToken: accessToken,
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
