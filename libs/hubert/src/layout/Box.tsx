import * as React from 'react';
import clsx from 'clsx';

import styles from './Box.module.scss';

export type BoxProps = React.HTMLProps<HTMLDivElement>;

export const Box = React.forwardRef(
  (
    { children, className, ...props }: BoxProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div className={clsx(styles.root, className)} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
Box.displayName = 'LayoutBox';
