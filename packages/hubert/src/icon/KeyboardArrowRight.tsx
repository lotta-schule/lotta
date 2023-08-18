import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const KeyboardArrowRight = React.memo<React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      {...props}
    >
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  )
);
KeyboardArrowRight.displayName = 'KeyboardArrowRightIcon';
