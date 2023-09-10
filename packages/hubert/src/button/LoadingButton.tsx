import * as React from 'react';
import { Button, ButtonProps } from './Button';
import { CircularProgress } from '../progress';
import clsx from 'clsx';

import styles from './LoadingButton.module.scss';

export type LoadingButtonProps = {
  /**
   * Wether the button is in a loading state
   */
  loading?: boolean;
} & Omit<ButtonProps, 'icon' | 'onlyIcon'>;

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ loading, disabled, label, children, className, ...props }, ref) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      ref={ref}
      className={clsx(styles.root, className, { [styles.isLoading]: loading })}
    >
      <CircularProgress
        isIndeterminate
        aria-hidden={loading ? false : true}
        color={'rgb(var(--lotta-disabled-color))'}
        className={clsx(styles.circularProgress)}
        size={'1.4em'}
      />
      <span className={clsx(styles.label)}>{label || children}</span>
    </Button>
  );
});
LoadingButton.displayName = 'LoadingButton';
