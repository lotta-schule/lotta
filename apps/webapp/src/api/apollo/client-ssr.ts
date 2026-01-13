'use client';
import { ApolloLink } from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { createWebsocketLink } from './links/websocketLink';
import { TenantModel } from 'model';
import { createErrorLink } from './links/errorLink';
import { createAuthLink } from './links/authLink';
import { createHttpLink } from './links/httpLink';
import { createSentryTracingLink } from './links/sentryTracingLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';
import { getMainDefinition } from '@apollo/client/utilities';

export const createSSRClient = (
  tenant: Pick<TenantModel, 'id'>,
  socketUrl?: string | null,
  accessToken?: string
): ApolloClient => {
  const websocketLink = createWebsocketLink(tenant, socketUrl, accessToken);
  const httpLink = createHttpLink({
    requestExtraHeaders: () => ({
      tenant: `id:${tenant.id}`,
    }),
  });
  const networkLink = websocketLink
    ? ApolloLink.split(
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
        createSentryTracingLink(),
        new SSRMultipartLink({
          stripDefer: true,
        }),
        createVariableInputMutationsLink(),
        networkLink,
      ].filter(Boolean)
    ),
    incrementalHandler: new Defer20220824Handler(),
  });
};
