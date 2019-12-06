import React, { memo, useMemo } from 'react';
import { Grow, Theme, makeStyles } from '@material-ui/core';
import { ApolloError } from 'apollo-client';
import { fade } from '@material-ui/core/styles';
import clsx from 'clsx';

export interface ErrorMessageProps {
    error?: Error | ApolloError | string | null;
    className?: string;
    children?: any;
}

const useStyles = makeStyles<Theme, { hasError: boolean }>(theme => ({
    root: {
        backgroundColor: fade(theme.palette.error.main, .5),
        color: theme.palette.error.contrastText,
        borderColor: theme.palette.error.main,
        borderWidth: ({ hasError }) => hasError ? 1 : 0,
        borderStyle: 'solid',
        marginBottom: ({ hasError }) => hasError ? theme.spacing(1) : 0,
        padding: ({ hasError }) => hasError ? theme.spacing(1) : 0,
        borderRadius: theme.shape.borderRadius,
        transition: 'all ease-in 150ms'
    }
}));

export const ErrorMessage = memo<ErrorMessageProps>(({ error, className, children }) => {
    const styles = useStyles({ hasError: !!error });
    const errorMessage = useMemo(() => {
        const errorMessage = typeof error === 'string' ? error : error && error.message; // TODO: TS 3.7
        if (errorMessage) {
            return errorMessage.replace(/^GraphQL error: /, '');
        }
    }, [error]);
    return (
        <Grow in={!!error}>
            <div className={clsx(styles.root, className)}>
                {errorMessage}
                {children}
            </div>
        </Grow>
    )
});