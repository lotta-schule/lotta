import * as React from 'react';
import clsx from 'clsx';
import './radio.scss';

export type RadioProps = {
    featureColor?: [red: number, green: number, blue: number];
} & React.HTMLProps<HTMLElement>;

export const Radio = React.forwardRef<any, RadioProps>(
    ({ children, className, featureColor, ...props }, ref) => {
        const customStyle =
            featureColor &&
            ({
                '--control-indicator-color': featureColor.join(', '),
            } as React.CSSProperties);
        return (
            <label style={customStyle} className={'lotta-radio'}>
                {children}
                <input
                    {...props}
                    ref={ref}
                    className={clsx(className, 'lotta-radio')}
                    type={'radio'}
                />
                <div className={'lotta-radio__control-indicator'} />
            </label>
        );
    }
);
