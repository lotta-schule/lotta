'use client';

import * as AbsintheSocket from '@absinthe/socket';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix';
import { TenantModel } from 'model';
import { isBrowser } from 'util/isBrowser';

const createAbsoluteSocketUrl = (urlString: string) => {
  if (/^\//.test(urlString)) {
    const url = new URL(window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    url.pathname = urlString;
    return url.toString();
  }
  return urlString;
};

export const createWebsocketLink = (
  tenant: TenantModel,
  socketUrl?: string | null,
  accessToken?: string | null
) => {
  if (!socketUrl || !isBrowser()) {
    return null;
  }

  const phoenixSocket = new PhoenixSocket(createAbsoluteSocketUrl(socketUrl), {
    params: () => {
      if (accessToken) {
        return { token: accessToken, tid: tenant?.id };
      } else {
        return { tid: tenant?.id };
      }
    },
  });

  const absintheSocket = AbsintheSocket.create(phoenixSocket);

  return createAbsintheSocketLink(absintheSocket);
};
