import * as React from 'react';
import clsx from 'clsx';

import styles from './Toolbar.module.scss';

export type ToolbarProps = React.HTMLProps<HTMLDivElement>;

export const Toolbar = ({ children, className, ...props }: ToolbarProps) => {
  return (
    <div className={clsx(styles.root, className)} {...props}>
      {children}
    </div>
  );
};
