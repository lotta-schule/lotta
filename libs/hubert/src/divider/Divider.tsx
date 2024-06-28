import * as React from 'react';
import clsx from 'clsx';

import styles from './Divider.module.scss';

export type DividerProps = React.HTMLProps<HTMLHRElement>;

export const Divider = React.memo(({ className, ...props }: DividerProps) => {
  return <hr className={clsx(styles.divider, className)} {...props} />;
});
Divider.displayName = 'Divider';
