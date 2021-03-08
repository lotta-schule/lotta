import * as React from 'react';
import { Grow, Theme, makeStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import clsx from 'clsx';

export interface MessageProps extends React.HTMLProps<HTMLDivElement> {
    message?: string | null;
    color: string;
    className?: string;
    children?: any;
}

const useStyles = makeStyles<Theme, { enabled: boolean; color: string }>(
    (theme) => ({
        root: {
            backgroundColor: ({ color }) => fade(color, 0.5),
            color: theme.palette.error.contrastText,
            borderColor: ({ color }) => color,
            borderWidth: ({ enabled }) => (enabled ? 1 : 0),
            borderStyle: 'solid',
            marginBottom: ({ enabled }) => (enabled ? theme.spacing(1) : 0),
            padding: ({ enabled }) => (enabled ? theme.spacing(1) : 0),
            borderRadius: theme.shape.borderRadius,
            transition: 'all ease-in 150ms',
        },
    })
);

export const Message = React.memo<MessageProps>(
    ({ message, color, className, children, ...otherProps }) => {
        const styles = useStyles({ enabled: !!message, color });

        return (
            <Grow in={!!message}>
                <div
                    role={'alert'}
                    aria-label={message || undefined}
                    className={clsx(styles.root, className)}
                    {...otherProps}
                >
                    {message}
                    {children}
                </div>
            </Grow>
        );
    }
);
