import * as React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';
import clsx from 'clsx';

export type ButtonProps = {
    /**
     * Button contents
     */
    label?: string;

    /**
     * Icon to show on the button side
     */
    icon?: React.ReactElement;

    /**
     * Disable setting a minimal height
     */
    small?: boolean;

    /**
     * Force style for button with only icon and without label,
     * even if child is found
     */
    onlyIcon?: boolean;
} & BaseButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ icon, label, onlyIcon, small, children, ...props }, ref) => {
        return (
            <BaseButton
                {...props}
                ref={ref}
                className={clsx('lotta-button', props.className, {
                    'only-icon': onlyIcon || (icon && !(label || children)),
                    small: small,
                })}
            >
                {icon && <span className={'lotta-button_icon'}>{icon}</span>}
                {(label ?? children) && (
                    <span className={'lotta-button_text'}>
                        {label ?? children}
                    </span>
                )}
            </BaseButton>
        );
    }
);
Button.displayName = 'Button';
