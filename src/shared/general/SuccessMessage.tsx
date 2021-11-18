import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { Message } from './Message';

export interface SuccessMessageProps {
    message?: string;
    className?: string;
}

export const SuccessMessage = React.memo<SuccessMessageProps>(
    ({ message, className }) => {
        const theme = useTheme();
        return (
            <Message
                color={theme.palette.success.main}
                message={message}
                className={className}
            />
        );
    }
);
SuccessMessage.displayName = 'SuccessMessage';
