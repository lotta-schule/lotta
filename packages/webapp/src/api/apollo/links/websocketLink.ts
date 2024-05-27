'use client';

import * as AbsintheSocket from '@absinthe/socket';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix';
import { TenantModel } from 'model';
import { isBrowser } from 'util/isBrowser';
import { appConfig } from 'config';

const createAbsoluteSocketUrl = (urlString: string) => {
  if (/^\//.test(urlString)) {
    const url = new URL(window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    url.pathname = urlString;
    return url.toString();
  }
  return urlString;
};

export const createWebsocketLink = (tenant: TenantModel) => {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const phoenixSocket =
    isBrowser() && socketUrl
      ? new PhoenixSocket(createAbsoluteSocketUrl(socketUrl), {
          params: () => {
            const token = localStorage.getItem('id');
            if (token) {
              return { token, tid: tenant?.id };
            } else {
              return { tid: tenant?.id };
            }
          },
        })
      : null;

  const absintheSocket = phoenixSocket
    ? AbsintheSocket.create(phoenixSocket)
    : null;

  return absintheSocket ? createAbsintheSocketLink(absintheSocket) : null;
};
