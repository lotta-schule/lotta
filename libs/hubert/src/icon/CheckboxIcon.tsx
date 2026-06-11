import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const CheckboxIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="checkbox-icon"
      {...props}
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
);
CheckboxIcon.displayName = 'CheckboxIcon';
