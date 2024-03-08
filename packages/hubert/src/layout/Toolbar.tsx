import * as React from 'react';
import clsx from 'clsx';

import styles from './Toolbar.module.scss';

export type ToolbarProps = {
  stackOnMobile?: boolean;
  hasScrollableParent?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const Toolbar = ({
  children,
  className,
  stackOnMobile,
  hasScrollableParent,
  ...props
}: ToolbarProps) => {
  return (
    <div
      className={clsx(styles.root, className, {
        [styles.stackOnMobile]: stackOnMobile,
        [styles.hasScrollableParent]: hasScrollableParent,
      })}
      {...props}
    >
      {children}
    </div>
  );
};
