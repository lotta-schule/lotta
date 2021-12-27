import * as React from 'react';
import clsx from 'clsx';

import styles from './Tab.module.scss';

export type TabbarProps = {
    className?: string;
};

export const Tabbar: React.FC<TabbarProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={clsx(styles.tabbar, className)} {...props}>
            {children}
        </div>
    );
};
Tabbar.displayName = 'Tabbar';
