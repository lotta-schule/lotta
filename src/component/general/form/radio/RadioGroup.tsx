import * as React from 'react';
import './radio.scss';
import { RadioProps } from './Radio';

export type RadioGroupProps = {
    name: string;
    children?: React.ReactElement<RadioProps>[];
} & React.HTMLProps<HTMLDivElement>;

export const RadioGroup = React.forwardRef<any, RadioGroupProps>(
    ({ children, className, name, ...props }, ref) => (
        <div {...props} className={'lotta-radio-group'}>
            {React.Children.map(children as any, (child: React.ReactElement) =>
                React.cloneElement(child, { name })
            )}
        </div>
    )
);
