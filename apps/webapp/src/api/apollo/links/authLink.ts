import { ApolloLink } from '@apollo/client';
import { Observable, ObservableSubscription } from '@apollo/client/utilities';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { isBrowser } from 'util/isBrowser';

const REFRESH_TOKEN_BUFFER = 5 * 60; // 5 minutes

type AuthLinkParams = {
  initialToken?: string;
  sendRefreshTokenRequest?: () => Promise<string>;
};

let currentToken: string | null = null;

export const createAuthLink = ({
  initialToken,
  sendRefreshTokenRequest,
}: AuthLinkParams) =>
  new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let handle: ObservableSubscription;
      let closed = false;

      Promise.resolve(operation.getContext())
        .then(async (context) => {
          const token = isBrowser()
            ? initialToken
            : currentToken || initialToken;
          if (initialToken) {
            const decoded = jwtDecode<JwtPayload>(initialToken);

            if (!decoded) {
              return context;
            }

            const now = Date.now() / 1000;
            const expires = decoded.exp;

            console.log('expires', expires, now);

            if (
              expires &&
              expires - REFRESH_TOKEN_BUFFER <= now &&
              sendRefreshTokenRequest
            ) {
              const newToken = await sendRefreshTokenRequest();

              if (newToken) {
                context.headers = {
                  ...context.headers,
                  authorization: `Bearer ${newToken}`,
                };
                context.accessToken = newToken;
                if (isBrowser()) {
                  currentToken = newToken;
                }
                return context;
              }
            }

            context.headers = {
              ...context.headers,
              authorization: `Bearer ${initialToken}`,
            };
            context.accessToken = token;
          }
          return context;
        })
        .then(operation.setContext)
        .then(() => {
          if (closed) return;
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        closed = true;
        if (handle) handle.unsubscribe();
      };
    });
  });
