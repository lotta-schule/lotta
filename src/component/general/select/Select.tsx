import * as React from 'react';
import clsx from 'clsx';
import './select.scss';

export type SelectProps = {} & React.HTMLProps<HTMLSelectElement>;

/**
 * Primary UI component for user interaction
 */
export const Select = React.forwardRef<any, SelectProps>(
    ({ children, className, ...props }, ref) => (
        <select
            {...props}
            ref={ref}
            className={clsx(className, 'lotta-select')}
        >
            {children}
        </select>
    )
);
