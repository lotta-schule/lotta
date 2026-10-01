import * as React from 'react';
import type { ErrorLike } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const useGetFieldError = (error?: ErrorLike | null) => {
  return React.useCallback(
    (fieldName: string): string | false => {
      if (error && CombinedGraphQLErrors.is(error)) {
        const messages = error.errors
          .map((graphQLError: any) => graphQLError?.details?.[fieldName])
          .filter(Boolean) as string[];
        if (messages.length) {
          return messages[0];
        }
      }
      return false;
    },
    [error]
  );
};
