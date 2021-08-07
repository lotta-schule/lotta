import * as React from 'react';
import clsx from 'clsx';
import './label.scss';

export type LabelProps = {
    label: string;
} & React.HTMLProps<HTMLLabelElement>;

export const Label = React.forwardRef<any, LabelProps>(
    ({ children, className, label, ...props }, ref) => (
        <label {...props} ref={ref} className={clsx(className, 'lotta-label')}>
            <span className={'lotta-label__label'}>{label}</span>
            {children}
        </label>
    )
);
