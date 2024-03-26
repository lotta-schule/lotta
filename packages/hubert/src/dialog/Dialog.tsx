'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  FocusScope,
  mergeProps,
  useDialog,
  useModal,
  useOverlay,
} from 'react-aria';
import { motion } from 'framer-motion';
import { Button } from '../button/Button';
import { Divider } from '../divider/Divider';
import { usePreventScroll } from '../util';
import { Close } from '../icon';
import clsx from 'clsx';

import styles from './dialog.module.scss';

interface DialogProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  open?: boolean;
  onRequestClose?: () => void | null;
}

export const Dialog: React.FC<DialogProps & { open?: boolean }> = ({
  open,
  onRequestClose,
  style,
  ...props
}) => {
  const isBrowser = typeof window !== 'undefined';

  const element = React.useRef<HTMLDivElement | null>(null);

  if (isBrowser && element.current === null) {
    element.current = document.createElement('div');
    const dialogContainer =
      document.getElementById('dialogContainer') ||
      (() => {
        const container = document.createElement('div');
        container.id = 'dialogContainer';
        document.body.appendChild(container);
        return container;
      })();
    dialogContainer.appendChild(element.current);
  }

  React.useEffect(() => () => element.current?.remove(), []);

  React.useEffect(() => {
    if (open) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Escape') {
          e.preventDefault();
          onRequestClose?.();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [onRequestClose, open]);

  if (!open || !isBrowser) {
    return null;
  }

  return ReactDOM.createPortal(
    <DialogShell style={style} onRequestClose={onRequestClose} {...props} />,
    element.current as HTMLDivElement
  );
};

export const DialogShell = ({
  children,
  className,
  style,
  title,
  onRequestClose,
  ...otherProps
}: DialogProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  usePreventScroll();
  const { modalProps } = useModal();
  const { overlayProps, underlayProps } = useOverlay(
    { onClose: () => onRequestClose?.(), isKeyboardDismissDisabled: true },
    ref
  );
  const { dialogProps, titleProps } = useDialog(otherProps as any, ref);

  const innerProps = mergeProps(
    otherProps,
    overlayProps,
    dialogProps,
    modalProps
  ) as any;

  return (
    <motion.div
      className={styles.root}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...(underlayProps as any)}
    >
      <motion.div
        {...innerProps}
        initial={{ scaleY: 0, y: -150 }}
        animate={{ scaleY: 1, y: 0 }}
        className={clsx(styles.dialog, className)}
        ref={ref}
      >
        <FocusScope contain autoFocus>
          <section>
            {onRequestClose && (
              <Button
                small
                title={'schließen'}
                className={styles.close}
                onClick={() => onRequestClose()}
                icon={<Close />}
              />
            )}
            <h3 {...titleProps}>{title}</h3>
            <Divider />
          </section>
          {children}
        </FocusScope>
      </motion.div>
    </motion.div>
  );
};

export const DialogContent: React.FC<React.HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <section className={clsx(className, styles.content)} {...props} />;
};

export const DialogActions: React.FC<React.HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <section className={clsx(className, styles.actions)} {...props} />;
};
