import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const Delete = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="delete-icon"
        ref={ref}
        {...props}
      >
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
      </svg>
    )
  )
);
Delete.displayName = 'DeleteIcon';
