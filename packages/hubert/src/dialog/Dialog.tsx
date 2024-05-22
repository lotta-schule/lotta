'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DialogShell } from './DialogHelpers';

export interface DialogProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  open?: boolean;
  wide?: boolean;
  onRequestClose?: () => void | null;
}

export const Dialog = ({
  open,
  onRequestClose,
  style,
  ...props
}: DialogProps & { open?: boolean }) => {
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
