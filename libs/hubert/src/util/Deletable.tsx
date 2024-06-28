import * as React from 'react';
import { Button } from '../button/Button';
import { Close } from '../icon';
import clsx from 'clsx';

import styles from './Deletable.module.scss';

export type DeletableProps = Omit<
  React.HTMLProps<HTMLDivElement> & {
    className?: string;
    title?: string;
    onDelete?: React.MouseEventHandler<HTMLButtonElement> | null;
  },
  'ref'
>;

export const Deletable = React.forwardRef(
  (
    {
      children,
      onDelete,
      title = 'löschen',
      className,
      ...props
    }: DeletableProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        {onDelete && (
          <Button
            small
            className={styles.button}
            icon={<Close />}
            title={title}
            onClick={onDelete ?? undefined}
          />
        )}
        {children}
      </div>
    );
  }
);
Deletable.displayName = 'Deletable';
