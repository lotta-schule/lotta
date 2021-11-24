import React from 'react';
import clsx from 'clsx';

import styles from './Box.module.scss';

interface BoxProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Box: React.FC<BoxProps> = ({ children, className, style }) => {
    return (
        <div style={style} className={clsx(styles.box, className)}>
            {children}
        </div>
    );
};
