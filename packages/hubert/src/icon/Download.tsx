import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const Download = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 -960 960 960"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        ref={ref}
        {...props}
      >
        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
      </svg>
    )
  )
);
Download.displayName = 'DownloadIcon';
