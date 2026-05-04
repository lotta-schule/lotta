'use client';

import * as React from 'react';
import { usePreventScroll } from '../util/index.js';
import { Divider } from '../divider/index.js';
import { Button } from '../button/index.js';
import { Close } from '../icon/index.js';
import { ButtonGroupContextProvider } from '../button/ButtonGroupContext.js';
import clsx from 'clsx';

import styles from './Dialog.module.scss';

export type DialogProps = React.PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  open?: boolean;
  wide?: boolean;
  onRequestClose?: () => void | null;
}>;

export const Dialog = ({
  title,
  open,
  onRequestClose,
  className,
  wide,
  children,
  ...props
}: DialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);
  usePreventScroll({ isDisabled: !open });

  return (
    <ButtonGroupContextProvider reset>
      <dialog
        role="dialog"
        ref={dialogRef}
        title={title}
        onClose={(e) => {
          e.stopPropagation();
          onRequestClose?.();
        }}
        {...props}
        className={clsx(styles.root, className, { [styles.wide]: wide })}
      >
        {open && (
          <>
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
              <h3>{title}</h3>
              <Divider />
            </section>
            {children}
          </>
        )}
      </dialog>
    </ButtonGroupContextProvider>
  );
};

export const DialogContent: React.FC<React.HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <section
      className={clsx(className, 'HubertDialogContent', styles.content)}
      {...props}
    />
  );
};

export const DialogActions: React.FC<React.HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <section className={clsx(className, styles.actions)} {...props} />;
};
