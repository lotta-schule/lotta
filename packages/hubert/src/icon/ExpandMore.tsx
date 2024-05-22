import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const ExpandMore = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="expand-more-icon"
        ref={ref}
        {...props}
      >
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
      </svg>
    )
  )
);
ExpandMore.displayName = 'ExpandMoreIcon';
