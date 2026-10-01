import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const TextFormat = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="textformat-icon"
      {...props}
    >
      <path d="M10.65 3 4 21h2.95l1.62-4.68h6.86L17.05 21H20L13.35 3h-2.7zm-1.2 10.62L12 6.06l2.55 7.56h-5.1z" />
    </svg>
  )
);
TextFormat.displayName = 'TextFormatIcon';
