import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const DeleteOutline = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="delete-outline-icon"
        ref={ref}
        {...props}
      >
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z" />
      </svg>
    )
  )
);
DeleteOutline.displayName = 'DeleteOutlineIcon';
