import * as React from 'react';
import clsx from 'clsx';
import './button-group.scss';

export interface ButtonGroupProps {
    fullWidth?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
    fullWidth,
    className,
    style,
    children,
}) => {
    return (
        <div
            role={'group'}
            style={style}
            className={clsx(
                'lotta-button-group',
                { 'full-width': fullWidth },
                className
            )}
        >
            {children}
        </div>
    );
};
