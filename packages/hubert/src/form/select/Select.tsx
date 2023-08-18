import * as React from 'react';
import clsx from 'clsx';

import styles from './select.module.scss';

export type SelectProps = React.HTMLProps<HTMLSelectElement>;

export const Select = React.forwardRef<any, SelectProps>(
  ({ children, className, ...props }, ref) => (
    <select {...props} ref={ref} className={clsx(className, styles.root)}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';
