import * as React from 'react';
import clsx from 'clsx';
import './radio.scss';

export type RadioProps = {
    label?: string;
    featureColor?: [red: number, green: number, blue: number];
} & React.HTMLProps<HTMLElement>;

export const Radio = React.forwardRef<any, RadioProps>(
    ({ children, label, className, featureColor, ...props }, ref) => {
        const customStyle =
            featureColor &&
            ({
                '--control-indicator-color': featureColor.join(', '),
            } as React.CSSProperties);
        return (
            <label style={customStyle} className={'lotta-radio'}>
                {label}
                {children}
                <input
                    {...props}
                    ref={ref}
                    aria-label={
                        props['aria-label'] ||
                        (!props['aria-labelledby'] ? label : undefined)
                    }
                    className={clsx(className, 'lotta-radio')}
                    type={'radio'}
                />
                <div className={'lotta-radio__control-indicator'} />
            </label>
        );
    }
);
