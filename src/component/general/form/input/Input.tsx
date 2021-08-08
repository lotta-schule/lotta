import * as React from 'react';
import clsx from 'clsx';
import './input.scss';

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
            className={clsx(className, 'lotta-input', {
                'lotta-input__inline': inline,
            })}
        />
    )
);
