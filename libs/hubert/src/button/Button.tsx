'use client';

import * as React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useButtonGroupContext } from './ButtonGroupContext';
import clsx from 'clsx';

import styles from './Button.module.scss';
import buttonGroupStyles from './ButtonGroup.module.scss';

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

  /**
   * Add custom claaes to the element tree
   **/
  classes?: {
    root?: string;
    onlyIcon?: string;
    icon?: string;
    label?: string;
  };
} & BaseButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { icon, label, onlyIcon, small, children, classes, className, ...props },
    ref
  ) => {
    const showOnlyIcon = onlyIcon || (icon && !(label || children));
    const { grouped } = useButtonGroupContext();

    return (
      <BaseButton
        {...props}
        ref={ref}
        className={clsx(
          styles.root,
          className,
          classes?.root,
          showOnlyIcon && [styles.onlyIcon, classes?.onlyIcon],
          {
            [styles.small]: small,
            [styles.grouped]: grouped,
            [buttonGroupStyles.grouped]: grouped,
          }
        )}
      >
        {icon && (
          <span className={clsx(styles.icon, classes?.icon)}>{icon}</span>
        )}
        {(label ?? children) && (
          <span className={clsx(styles.label, classes?.label)}>
            {label ?? children}
          </span>
        )}
      </BaseButton>
    );
  }
);
Button.displayName = 'Button';
