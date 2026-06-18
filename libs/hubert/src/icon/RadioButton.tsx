import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const RadioButton = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="radiobutton-icon"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
);
RadioButton.displayName = 'RadioButtonIcon';
