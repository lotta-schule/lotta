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

  /**
   * The aria-label property that will be attached to the loading spinner
   */
  loadingLabel?: string;
} & Omit<ButtonProps, 'icon' | 'onlyIcon'>;

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    { loading, disabled, label, loadingLabel, children, className, ...props },
    ref
  ) => {
    return (
      <Button
        {...props}
        disabled={loading || disabled}
        ref={ref}
        className={clsx(styles.root, className, {
          [styles.isLoading]: loading,
        })}
      >
        <CircularProgress
          isIndeterminate
          aria-label={loadingLabel || 'Wird gerade geladen ...'}
          aria-hidden={loading ? false : true}
          color={'rgb(var(--lotta-disabled-color))'}
          className={clsx(styles.circularProgress)}
          size={'1.4em'}
        />
        <span className={clsx(styles.label)}>{label || children}</span>
      </Button>
    );
  }
);
LoadingButton.displayName = 'LoadingButton';
