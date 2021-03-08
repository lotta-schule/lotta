import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { ApolloError } from '@apollo/client';
import { Message } from './Message';

export interface ErrorMessageProps {
    error?: Error | ApolloError | string | null;
    className?: string;
    children?: any;
}

export const ErrorMessage = React.memo<ErrorMessageProps>(
    ({ error, className, children }) => {
        const theme = useTheme();
        const errorMessage = React.useMemo(() => {
            const errorMessage =
                typeof error === 'string' ? error : error?.message;
            if (errorMessage) {
                return errorMessage.replace(/^GraphQL error: /, '');
            }
        }, [error]);
        return (
            <Message
                role={'alert'}
                color={theme.palette.error.main}
                message={errorMessage}
                className={className}
            >
                {children}
            </Message>
        );
    }
);
