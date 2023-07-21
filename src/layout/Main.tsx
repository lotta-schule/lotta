import * as React from 'react';
import clsx from 'clsx';

import styles from './Main.module.scss';

export interface MainProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode | React.ReactNode[];
}

export const Main: React.FC<MainProps> = ({ className, children, style }) => {
    return (
        <div className={clsx(styles.root, className)}>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
};
Main.displayName = 'BaseLayoutMainContent';
