import * as React from 'react';
import clsx from 'clsx';

import styles from './input.module.scss';

export type InputProps = {
    /**
     * When set, the input field does not style as input field
     */
    inline?: boolean;
} & React.HTMLProps<HTMLInputElement>;

export const Input = React.forwardRef<any, InputProps>(
    ({ children, className, inline, ...props }, ref) => (
        <input
            {...props}
            ref={ref}
            className={clsx(className, styles.root, {
                [styles.inline]: inline,
            })}
        />
    )
);
Input.displayName = 'Input';
