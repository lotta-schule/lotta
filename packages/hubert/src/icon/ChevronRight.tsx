import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const ChevronRight = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        ref={ref}
        {...props}
      >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    )
  )
);
ChevronRight.displayName = 'ChevronRightIcon';
