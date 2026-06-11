import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const TextLines = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="textlines-icon"
      {...props}
    >
      <path d="M3 4.5h18v2.4H3v-2.4zm0 4.7h18v2.4H3V9.2zm0 4.7h18v2.4H3v-2.4zm0 4.7h18V21H3v-2.4z" />
    </svg>
  )
);
TextLines.displayName = 'TextLinesIcon';
