import * as React from 'react';
import clsx from 'clsx';

import styles from './Badge.module.scss';

export type BadgeProps = React.HTMLProps<HTMLDivElement> & {
  className?: string;

  value?: number | string | null;
};

export const Badge = React.memo(
  ({ className, value, ...props }: BadgeProps) => {
    if (!value) {
      return null;
    }
    return (
      <div role={'status'} className={clsx(className, styles.root)} {...props}>
        {value}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
