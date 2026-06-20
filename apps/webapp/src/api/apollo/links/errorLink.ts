import { Observable } from '@apollo/client';
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  ServerError,
} from '@apollo/client/errors';
import { onError } from '@apollo/client/link/error';
import { sendRefreshRequest } from '#/api/auth';
import { appConfig } from '#/config';

// Single-flight: deduplicates parallel 401s so only one refresh call is made.
let pendingRefresh: Promise<string | null> | null = null;

export const createErrorLink = () =>
  onError(({ error, operation, forward }) => {
    // 401: access token expired mid-session — attempt a silent refresh and retry.
    if (ServerError.is(error) && error.statusCode === 401) {
      if (!pendingRefresh) {
        pendingRefresh = sendRefreshRequest(undefined, undefined, {
          baseURL: appConfig.get('API_URL'),
        })
          .then(({ accessToken }) => accessToken)
          .catch(() => null)
          .finally(() => {
            pendingRefresh = null;
          });
      }

      return new Observable((observer) => {
        pendingRefresh!.then((newToken) => {
          if (!newToken) {
            observer.error(error);
            return;
          }
          // Set the new token on this operation so authLink uses it for the retry.
          operation.setContext({ authToken: newToken });
          forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        });
      });
    }

    // Errors are automatically captured by Sentry via instrumentation
    // No need for console logging
  });
