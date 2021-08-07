import * as React from 'react';
import clsx from 'clsx';
import './radio.scss';

export type RadioProps = {
    featureColor?: string;
} & React.HTMLProps<HTMLInputElement>;

export const Radio = React.forwardRef<any, RadioProps>(
    ({ children, className, featureColor, ...props }, ref) => (
        <label className={'lotta-radio'}>
            {children}
            <input
                {...props}
                ref={ref}
                className={clsx(className, 'lotta-radio')}
                type={'radio'}
            />
            <div className={'lotta-radio__control-indicator'} />
        </label>
    )
);
