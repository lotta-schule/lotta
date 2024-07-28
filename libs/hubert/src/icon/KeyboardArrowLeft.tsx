import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const KeyboardArrowLeft = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="keyboard-arrow-left-icon"
      {...props}
    >
      <path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
    </svg>
  )
);
KeyboardArrowLeft.displayName = 'KeyboardArrowLeftIcon';
