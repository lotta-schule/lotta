import { ApolloLink } from '@apollo/client';
import { Observable, ObservableSubscription } from '@apollo/client/utilities';

type AuthLinkParams = {
  requestToken?: () => Promise<string | null | undefined>;
};

export const createAuthLink = ({ requestToken }: AuthLinkParams) =>
  new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let handle: ObservableSubscription;
      let closed = false;

      Promise.resolve(operation.getContext())
        .then(async (context) => {
          const token = await requestToken?.();

          if (token) {
            context.headers = {
              ...context.headers,
              authorization: `Bearer ${token}`,
            };
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
