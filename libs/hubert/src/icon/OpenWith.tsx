import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const OpenWith = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="open-with-icon"
        ref={ref}
        {...props}
      >
        <path d="M10 9h4V6h3l-5-5-5 5h3zm-1 1H6V7l-5 5 5 5v-3h3zm14 2-5-5v3h-3v4h3v3zm-9 3h-4v3H7l5 5 5-5h-3z" />
      </svg>
    )
  )
);
OpenWith.displayName = 'OpenWithIcon';
