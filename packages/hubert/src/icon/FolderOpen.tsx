import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FolderOpen = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 -960 960 960"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="folder-open-icon"
        ref={ref}
        {...props}
      >
        <path d="m160-160q-33 0-56.5-23.5t-23.5-56.5v-480q0-33 23.5-56.5t56.5-23.5h240l80 80h320q33 0 56.5 23.5t23.5 56.5h-433l-80-80h-207v480l96-320h684l-103 343q-8 26-29.5 41.5t-47.5 15.5zm84-80h516l72-240h-516zm0 0 72-240zm-84-400v-80z" />
      </svg>
    )
  )
);
FolderOpen.displayName = 'FolderOpenIcon';
