import * as React from 'react';
import { Button, ButtonProps } from '../../button';
import { useSplitView } from './SplitViewContext';
import clsx from 'clsx';

import styles from './SplitView.module.scss';

export type SplitViewButtonProps = Omit<ButtonProps, 'onClick' | 'ref'> & {
  action: 'open' | 'close';
};

export const SplitViewButton = ({
  className,
  action,
  'aria-label': ariaLabel,
  ...props
}: SplitViewButtonProps) => {
  const { canCloseSidebar, canOpenSidebar, open, close } = useSplitView();
  if (
    (action === 'open' && !canOpenSidebar) ||
    (action === 'close' && !canCloseSidebar)
  ) {
    return null;
  }

  return (
    <Button
      {...props}
      className={clsx(className, styles[`${action}Button`])}
      aria-label={
        ariaLabel ??
        (action === 'open' ? 'Seitenleiste öffnen' : 'Seitenleiste schließen')
      }
      onClick={() => {
        if (action === 'open') {
          open();
        } else {
          close();
        }
      }}
    />
  );
};
