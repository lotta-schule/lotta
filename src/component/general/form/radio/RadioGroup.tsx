import * as React from 'react';
import './radio.scss';
import { RadioProps } from './Radio';
import clsx from 'clsx';

export type RadioGroupProps = {
    name: string;
    value?: RadioProps['value'];
    onChange?: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: string
    ) => void;
    children?: React.ReactElement<RadioProps>[];
} & Omit<React.HTMLProps<HTMLDivElement>, 'value' | 'onChange'>;

export const RadioGroup = React.forwardRef<any, RadioGroupProps>(
    ({ children, className, name, value, onChange, ...props }, ref) => {
        const onChangeInput = (
            e: React.ChangeEvent<HTMLInputElement>,
            p: RadioProps
        ) => {
            if (
                (p.onChange?.(e) as any) !== false &&
                !e.isDefaultPrevented() &&
                e.target.name === name
            ) {
                onChange?.(e, e.target.value);
            }
        };
        return (
            <div
                ref={ref}
                role={'radiogroup'}
                {...props}
                className={clsx('lotta-radio-group', className)}
            >
                {React.Children.map(
                    children as any,
                    (child: React.ReactElement) => {
                        const props: RadioProps = child.props;
                        return React.cloneElement(child, {
                            name,
                            onChange: (e: any) => onChangeInput(e, props),
                            checked: props.checked ?? props.value === value,
                        });
                    }
                )}
            </div>
        );
    }
);
