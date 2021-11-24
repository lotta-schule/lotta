import * as React from 'react';
import clsx from 'clsx';

export type BaseButtonProps = {
    /**
     * Wether the button is currently 'active' or 'selected'
     */
    selected?: boolean;

    /**
     * Chose from different styles
     */
    variant?: 'default' | 'fill' | 'borderless' | 'error';

    /**
     * Wether the button should have a width of 100%
     */
    fullWidth?: boolean;

    /**
     * CSS Classname
     */
    className?: string;

    /**
     * CSS Styles
     */
    style?: React.CSSProperties;

    /**
     * Content to show on the button
     */
    children?: any;
} & React.HTMLProps<HTMLButtonElement>;

/**
 * Primary UI shared for userAvatar interaction
 */
export const BaseButton = React.forwardRef<any, BaseButtonProps>(
    (
        {
            children,
            style,
            className,
            variant = 'default',
            fullWidth = false,
            selected = false,
            ...props
        },
        ref
    ) => {
        const ComponentClass = props.href ? 'a' : ('button' as any);
        return React.createElement(
            ComponentClass,
            {
                ref,
                type: props.type ?? 'button',
                role: 'button',
                style,
                className: clsx(
                    'lotta-base-button',
                    `variant__${variant}`,
                    { selected, 'full-width': fullWidth },
                    className
                ),
                ...props,
            },
            children
        );
    }
);
BaseButton.displayName = 'BaseButton';
