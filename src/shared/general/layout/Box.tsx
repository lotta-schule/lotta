import React from 'react';
import clsx from 'clsx';
import './box.scss';

interface BoxProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Box: React.FC<BoxProps> = ({ children, className, style }) => {
    return (
        <div style={style} className={clsx('box', className)}>
            {children}
        </div>
    );
};
