import * as React from 'react';
import { ButtonProps } from '../button/Button';
import { NavigationButton } from '../button/NavigationButton';
import clsx from 'clsx';

import styles from './Tab.module.scss';

export type TabProps = Omit<ButtonProps, 'onClick' | 'ref'> & {
    value: string | number;
    selected?: boolean;
};

export const Tab: React.FC<TabProps> = ({ className, children, ...props }) => {
    return (
        <NavigationButton
            className={clsx(styles.tab, className)}
            role={'tab'}
            {...props}
        >
            {children}
        </NavigationButton>
    );
};
Tab.displayName = 'Tab';
