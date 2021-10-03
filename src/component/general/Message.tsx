import * as React from 'react';
import { Grow } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import clsx from 'clsx';

import styles from './Message.module.scss';

export interface MessageProps extends React.HTMLProps<HTMLDivElement> {
    message?: string | null;
    color: string;
    className?: string;
    children?: any;
}

export const Message = React.memo<MessageProps>(
    ({ message, color, className, children, ...otherProps }) => {
        const otherStyle: React.CSSProperties = {
            backgroundColor: fade(color, 0.5),
            borderColor: color,
        };

        return (
            <Grow in={!!message}>
                <div
                    role={'alert'}
                    aria-label={message || undefined}
                    style={otherStyle}
                    className={clsx(styles.root, className, {
                        [styles.enabled]: !!message,
                    })}
                    {...otherProps}
                >
                    {message}
                    {children}
                </div>
            </Grow>
        );
    }
);
Message.displayName = 'Message';
