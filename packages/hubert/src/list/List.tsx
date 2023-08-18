import * as React from 'react';
import clsx from 'clsx';

import styles from './List.module.scss';

export type ListProps = Omit<React.HTMLProps<HTMLUListElement>, 'ref'>;

export const List = React.forwardRef(
  (
    { children, className, ...props }: ListProps,
    ref: React.Ref<HTMLUListElement>
  ) => {
    return (
      <ul className={clsx(styles.root, className)} {...props} ref={ref}>
        {children}
      </ul>
    );
  }
);
List.displayName = 'List';
