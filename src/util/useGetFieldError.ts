import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';

export const useGetFieldError = (error?: ApolloError) => {
    return useCallback(
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
