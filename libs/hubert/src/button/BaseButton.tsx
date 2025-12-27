import * as React from 'react';
import clsx from 'clsx';

import styles from './BaseButton.module.scss';

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
} & Record<
  Exclude<
    string,
    | 'selected'
    | 'as'
    | 'variant'
    | 'fullWidth'
    | 'className'
    | 'style'
    | 'children'
  >,
  any
>;

/**
 * Primary UI shared for userAvatar interaction
 */
export const BaseButton = React.forwardRef<any, BaseButtonProps>(
  (
    {
      children,
      style,
      className,
      href,
      variant = 'default',
      fullWidth = false,
      selected = false,
      component = href ? 'a' : 'button',
      ...props
    },
    ref
  ) => {
    const selectedAriaAttribute =
      props.role && ['gridcell', 'option', 'row', 'tab'].includes(props.role)
        ? 'aria-selected'
        : 'aria-current';
    return React.createElement(
      component,
      {
        ref,
        href,
        type: props.type ?? 'button',
        role: 'button',
        style,
        'data-variant': variant,
        [selectedAriaAttribute]: selected,
        className: clsx(styles.root, className, {
          [styles.selected]: selected,
          [styles.fullWidth]: fullWidth,
        }),
        ...props,
      },
      children
    );
  }
);
BaseButton.displayName = 'BaseButton';
