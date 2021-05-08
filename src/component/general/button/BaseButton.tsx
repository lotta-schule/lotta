import * as React from 'react';
import clsx from 'clsx';
import './base-button.scss';

export interface BaseButtonProps
    extends React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > {
    /**
     * Wether the button is currently 'active' or 'selected'
     */
    selected?: boolean;

    /**
     * Chose from different styles
     */
    variant?: 'default' | 'fill' | 'error';

    /**
     * Wether the button should have a width of 100%
     */
    fullWidth?: boolean;

    /**
     * Content to show on the button
     */
    children?: any;
}

/**
 * Primary UI component for user interaction
 */
export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
    (
        {
            children,
            variant = 'default',
            fullWidth = false,
            selected = false,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={props.type ?? 'button'}
                {...props}
                className={clsx(
                    'lotta-base-button',
                    `variant__${variant}`,
                    { selected, 'full-width': fullWidth },
                    props.className
                )}
            >
                {children}
            </button>
        );
    }
);
