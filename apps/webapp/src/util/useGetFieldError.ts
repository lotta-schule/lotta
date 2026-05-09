import * as React from 'react';
import { ApolloError } from '@apollo/client/v4-migration';

export const useGetFieldError = (error?: ApolloError) => {
  return React.useCallback(
    (fieldName: string): string | false => {
      if (error) {
        const messages: string[] | undefined =
          error.graphQLErrors &&
          (error.graphQLErrors.map(
            (graphQLError: any) =>
              graphQLError &&
              graphQLError.details &&
              graphQLError.details[fieldName]
          ) as string[] | undefined);
        if (messages) {
          return messages[0];
        }
      }
      return false;
    },
    [error]
  );
};
