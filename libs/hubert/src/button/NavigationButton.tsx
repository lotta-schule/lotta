import * as React from 'react';
import { Button, ButtonProps } from './Button';
import clsx from 'clsx';

import styles from './NavigationButton.module.scss';

export type NavigationButtonProps = Omit<ButtonProps, 'variant'> & {
  secondary?: boolean;
};

export const NavigationButton = React.forwardRef<
  HTMLButtonElement,
  NavigationButtonProps
>(({ className, secondary, ...buttonProps }, ref) => {
  return (
    <Button
      {...buttonProps}
      ref={ref}
      classes={{
        root: clsx(styles.root, className, {
          [styles.secondary]: secondary,
          [styles.selected]: buttonProps.selected,
        }),
        icon: styles.icon,
        label: styles.label,
      }}
    />
  );
});
NavigationButton.displayName = 'NavigationButton';
