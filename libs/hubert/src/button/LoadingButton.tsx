'use client';

import * as React from 'react';
import { Button, ButtonProps } from './Button';
import { CircularProgress } from '../progress';
import { motion } from 'framer-motion';
import { Check, Close } from '../icon';
import clsx from 'clsx';

import styles from './LoadingButton.module.scss';

export type LoadingButtonState = 'idle' | 'loading' | 'success' | 'error';

export type LoadingButtonProps<T> = Omit<
  ButtonProps,
  'onlyIcon' | 'classes'
> & {
  /**
   * Wether the button is in a loading state
   */
  state?: LoadingButtonState;

  /**
   * The aria-label property that will be attached to the loading spinner
   */
  loadingLabel?: string;

  /**
   * The action to be executed when the button is clicked, or - if the type is set to `submit` - when a parent form is submitted.
   * This function should return a promise.
   * The button will automatically switch to the loading state
   * and then to the success or error state depending on the
   * result of the promise.
   */
  onAction?: (
    e: React.MouseEvent<HTMLButtonElement> | SubmitEvent
  ) => Promise<T>;

  /**
   * The callback to call when an error occurs during the onClick handler
   */
  onError?: (e: any) => void;

  /**
   * The callback to call when the onClick handler has been resolved
   */
  onComplete?: (value: T) => void;

  /**
   * Wether to reset the state of the button after a timeout
   * when the onClick handler has been resolved or rejected
   *
   * @default true
   */
  resetState?: boolean;

  classes?: ButtonProps['classes'] & {
    successIcon?: string;
    errorIcon?: string;
  };
};

const AnimatedCircularProgress = motion.create(CircularProgress);

/**
 * A button that can show a loading spinner, a success or an error icon
 * depending on the state of the button.
 * It can be used to show the user that an action is being executed,
 * or to show the result of an action.
 */
export const LoadingButton = <T = any,>({
  icon,
  disabled,
  label,
  loadingLabel,
  children,
  className,
  state,
  classes: { successIcon, errorIcon, ...classes } = {},
  resetState = true,
  onAction,
  onClick,
  onComplete,
  onError,
  ref: propRef,
  ...props
}: LoadingButtonProps<T>) => {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const defaultRef = React.useRef<React.ComponentRef<'button'>>(null);
  const ref = propRef || defaultRef;

  const [currentState, setCurrentState] = React.useState<LoadingButtonState>(
    state || 'idle'
  );

  const isDisabled = currentState !== 'idle' || disabled;

  const executeHandler = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement> | SubmitEvent) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.type === 'click') {
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }
      if (state) {
        // if a state has been explicitly set,
        // we don't want to handle the state internally
        if (onAction) {
          console.warn('onAction will be ignored when state is set');
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      let result: any;
      let didSucceed = false;

      try {
        setCurrentState('loading');
        result = await onAction?.(e);
        didSucceed = true;
        if (resetState === false) {
          onComplete?.(result);
        }
        setCurrentState('success');
      } catch (e) {
        setCurrentState('error');
        onError?.(e);
      } finally {
        if (resetState !== false) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setCurrentState('idle');
            if (didSucceed) {
              onComplete?.(result);
            }
          }, 2000);
        }
      }
    },
    [onAction, onClick, onComplete, onError, resetState, state, isDisabled]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (state) {
      setCurrentState(state);
    }
  }, [state]);

  React.useEffect(() => {
    if (props.type !== 'submit') {
      return;
    }

    const form = ref.current?.closest('form');
    if (form) {
      const callback = (e: SubmitEvent) => {
        executeHandler(e);
      };

      form.addEventListener('submit', callback);
      return () => {
        form.removeEventListener('submit', callback);
      };
    }
  }, [executeHandler, props.type, ref]);

  const currentIcon = React.useMemo(() => {
    switch (currentState) {
      case 'success':
        return <Check data-testid={'SuccessIcon'} />;
      case 'error':
        return <Close data-testid={'ErrorIcon'} />;
      case 'loading':
        return null;
      default:
        return icon;
    }
  }, [currentState, icon]);

  const animatedIcon = React.useMemo(
    () => (
      <motion.div
        initial={false}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, animationDelay: '500ms' },
        }}
        animate={currentState !== 'loading' ? 'visible' : 'hidden'}
        className={clsx(
          styles.iconContainer,
          currentState === 'success' && [styles.successIcon, successIcon],
          currentState === 'error' && [styles.errorIcon, errorIcon]
        )}
      >
        {currentIcon}
      </motion.div>
    ),
    [currentState, successIcon, errorIcon, currentIcon]
  );
  return (
    <Button
      {...props}
      disabled={currentState !== 'idle' || disabled}
      icon={animatedIcon}
      ref={ref}
      className={clsx(styles.root, className, {
        [styles.isLoading]: currentState === 'loading',
      })}
      classes={{
        ...classes,
        icon: clsx(classes?.icon, styles.icon),
      }}
      onClick={executeHandler}
    >
      {currentState === 'loading' && (
        <AnimatedCircularProgress
          isIndeterminate
          aria-label={loadingLabel || 'Wird gerade geladen ...'}
          color={'rgb(var(--lotta-disabled-color))'}
          className={clsx(styles.circularProgress)}
          size={'1.2em'}
        />
      )}
      <span className={clsx(styles.label)}>{label || children}</span>
    </Button>
  );
};
LoadingButton.displayName = 'LoadingButton';
