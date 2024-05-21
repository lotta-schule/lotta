'use client';

import * as AbsintheSocket from '@absinthe/socket';
import { TenantModel } from 'model';
import { Socket as PhoenixSocket } from 'phoenix';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';

const isBrowser = typeof window !== 'undefined';

// TODO: Get url correclty from env
const socketUrl = 'ws://127.0.0.1:4000/api/user-socket';

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
  const phoenixSocket =
    isBrowser && socketUrl
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
