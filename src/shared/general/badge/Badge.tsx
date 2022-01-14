import * as React from 'react';
import clsx from 'clsx';

import styles from './Badge.module.scss';

export type BadgeProps = {
    className?: string;

    value?: number | string | null;
};

export const Badge = React.forwardRef<any, BadgeProps>(
    ({ className, value, ...props }) => {
        if (!value) {
            return null;
        }
        return (
            <div
                role={'status'}
                className={clsx(className, styles.root)}
                {...props}
            >
                {value}
            </div>
        );
    }
);
Badge.displayName = 'Badge';
