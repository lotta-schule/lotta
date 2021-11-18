import * as React from 'react';
import clsx from 'clsx';

import styles from './label.module.scss';

export type LabelProps = {
    label: string;
} & React.HTMLProps<HTMLLabelElement>;

export const Label = React.forwardRef<any, LabelProps>(
    ({ children, className, label, ...props }, ref) => (
        <label {...props} ref={ref} className={clsx(className, styles.root)}>
            <span className={styles.label}>{label}</span>
            {children}
        </label>
    )
);
Label.displayName = 'Label';
