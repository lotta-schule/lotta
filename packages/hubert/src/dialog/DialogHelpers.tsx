import * as React from 'react';
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
import { type DialogProps } from './Dialog';
import clsx from 'clsx';

import styles from './dialog.module.scss';

export const DialogShell = ({
  children,
  className,
  style,
  title,
  wide,
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
        className={clsx(styles.dialog, className, { [styles.wide]: wide })}
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
