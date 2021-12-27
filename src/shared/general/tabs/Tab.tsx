import * as React from 'react';
import clsx from 'clsx';

import styles from './Tab.module.scss';

export type TabProps = {
    className?: string;
};

export const Tab: React.FC<TabProps> = ({ className, children, ...props }) => {
    return (
        <div className={clsx(styles.tab, className)} {...props}>
            {children}
        </div>
    );
};
Tab.displayName = 'Tab';
