import React, { memo, useMemo } from 'react';
import { useTheme } from '@material-ui/core';
import { ApolloError } from 'apollo-client';
import { Message } from './Message';

export interface ErrorMessageProps {
    error?: Error | ApolloError | string | null;
    className?: string;
    children?: any;
}

export const ErrorMessage = memo<ErrorMessageProps>(({ error, className, children }) => {
    const theme = useTheme();
    const errorMessage = useMemo(() => {
        const errorMessage = typeof error === 'string' ? error : error?.message;
        if (errorMessage) {
            return errorMessage.replace(/^GraphQL error: /, '');
        }
    }, [error]);
    return (
        <Message color={theme.palette.error.main} message={errorMessage} className={className}>
            {children}
        </Message>
    )
});