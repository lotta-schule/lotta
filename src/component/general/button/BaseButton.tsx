import * as React from 'react';
import { BaseElement, BaseElementProps } from '../BaseElement';
import clsx from 'clsx';
import './base-button.scss';

export type BaseButtonProps = {
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
} & BaseElementProps<'button'>;

/**
 * Primary UI component for user interaction
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
            as = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <BaseElement
                as={as}
                ref={ref as any}
                type={'type' in props ? props.type ?? 'button' : undefined}
                {...props}
                style={style}
                className={clsx(
                    'lotta-base-button',
                    `variant__${variant}`,
                    { selected, 'full-width': fullWidth },
                    className
                )}
            >
                {children}
            </BaseElement>
        );
    }
);
