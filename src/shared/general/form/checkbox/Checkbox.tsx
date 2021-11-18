import * as React from 'react';
import clsx from 'clsx';

import styles from './Checkbox.module.scss';

export type CheckboxProps = {
    /* The label can be either a string, or any Element or React shared. */
    label: any;

    featureColor?: [red: number, green: number, blue: number];
} & Omit<React.HTMLProps<HTMLInputElement>, 'type'>;

export const Checkbox = React.forwardRef<any, CheckboxProps>(
    ({ label, className, featureColor, ...props }, ref) => {
        const customStyle =
            featureColor &&
            ({
                '--control-indicator-color': featureColor.join(', '),
            } as React.CSSProperties);
        return (
            <label style={customStyle} className={clsx(styles.root)}>
                <input
                    {...props}
                    ref={ref}
                    aria-label={
                        props['aria-label'] ||
                        (!props['aria-labelledby'] ? label : undefined)
                    }
                    className={clsx(className, styles.Checkbox)}
                    type={'checkbox'}
                />
                <div className={styles.ControlIndicator} />
                {typeof label === 'string' ? <span>{label}</span> : label}
            </label>
        );
    }
);
Checkbox.displayName = 'Checkbox';
