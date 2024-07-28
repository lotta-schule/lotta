import * as React from 'react';
import clsx from 'clsx';

import styles from './List.module.scss';

export type ListProps = React.HTMLProps<HTMLUListElement>;

export const List = ({ children, className, ...props }: ListProps) => {
  return (
    <ul className={clsx(styles.root, className)} {...props}>
      {children}
    </ul>
  );
};
List.displayName = 'List';
