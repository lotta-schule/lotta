import { ApolloLink } from '@apollo/client';
import { Notifier, send, toObservable, unobserveOrCancel } from '@absinthe/socket';
// @ts-ignore
import { compose } from 'flow-static-land/lib/Fun';
import { print } from 'graphql';

import type { AbsintheSocket, GqlRequest } from '@absinthe/socket';
import type { DocumentNode } from 'graphql/language/ast';

interface ApolloOperation<Var extends Record<string, any> = any> {
  query: DocumentNode,
  variables: Var
};

const unobserveOrCancelIfNeeded = (absintheSocket: AbsintheSocket, notifier: any, observer: any) => {
  if (notifier && observer) {
    unobserveOrCancel(absintheSocket, notifier, observer);
  }
};

const notifierToObservable = (absintheSocket: AbsintheSocket, onError: (error: Error) => void, onStart: (notifier: Notifier<any, any>) => void) => (notifier: Notifier<any, any>) =>
  toObservable(absintheSocket, notifier, {
    onError,
    onStart,
    unsubscribe: unobserveOrCancelIfNeeded
  });

const getRequest = <Var extends Record<string, any> = any>({ query, variables }: ApolloOperation<Var>): GqlRequest<Var> => ({
  operation: print(query),
  variables
});

/**
 * Creates a terminating ApolloLink to request operations using given
 * AbsintheSocket instance
 */
export const createAbsintheSocketLink = ( absintheSocket: AbsintheSocket, onError?: (error: Error) => void, onStart?: (notifier: Notifier<any, any>) => void) =>
  new ApolloLink(
    compose(
      notifierToObservable(absintheSocket, onError ?? (() => {}), onStart ?? (() => {})),
      (request: any) => send(absintheSocket, request),
      getRequest
    )
  );
