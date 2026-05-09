import * as React from 'react';
import { Button } from '../button/Button.js';
import { Close } from '../icon/index.js';
import clsx from 'clsx';

import styles from './Deletable.module.scss';

export type DeletableProps = React.HTMLProps<HTMLDivElement> & {
  className?: string;
  title?: string;
  onDelete?: React.MouseEventHandler<HTMLButtonElement> | null;
};

export const Deletable = ({
  children,
  onDelete,
  title = 'löschen',
  className,
  ...props
}: DeletableProps) => {
  return (
    <div className={clsx(styles.root, className)} {...props}>
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
};
Deletable.displayName = 'Deletable';
