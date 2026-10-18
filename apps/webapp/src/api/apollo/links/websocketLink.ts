'use client';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { TenantModel } from '#/model';
import { isBrowser } from '#/util/isBrowser';

const createAbsoluteSocketUrl = (urlString: string) => {
  if (urlString.startsWith('/')) {
    const url = new URL(window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    url.pathname = urlString;
    return url.toString();
  }
  return urlString;
};

export const createWebsocketLink = (
  tenant: Pick<TenantModel, 'id'>,
  socketUrl?: string | null,
  accessToken?: string | null
) => {
  if (!socketUrl || !isBrowser()) {
    return null;
  }

  const client = createClient({
    url: createAbsoluteSocketUrl(socketUrl),
    connectionParams: () => {
      if (accessToken) {
        return { token: accessToken, tid: tenant?.id };
      } else {
        return { tid: tenant?.id };
      }
    },
    lazy: true,
    retryAttempts: Infinity,
  });

  return new GraphQLWsLink(client);
};
