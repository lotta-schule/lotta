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
import { createSentryTracingLink } from './links/sentryTracingLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';
import { getMainDefinition } from '@apollo/client/utilities';
import { sendRefreshRequest } from 'api/auth';

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
          sendRefreshTokenRequest: async () => {
            const res = await sendRefreshRequest({});

            if (!res) {
              throw new Error('Failed to refresh token');
            }
            return res.accessToken;
          },
        }),
        createSentryTracingLink(),
        new SSRMultipartLink({
          stripDefer: true,
        }),
        createVariableInputMutationsLink(),
        networkLink,
      ].filter(Boolean)
    ),
  });
};
