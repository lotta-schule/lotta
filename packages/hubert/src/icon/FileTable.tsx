import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileTable = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 512 677"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        ref={ref}
        {...props}
      >
        <path
          fill="#008f39"
          d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M155.7,250.2l36.3,51.9l36.3-51.9c7.6-10.9,22.6-13.5,33.4-5.9c10.8,7.6,13.5,22.6,5.9,33.4L221.3,344
	l46.4,66.2c7.6,10.9,5,25.8-5.9,33.4s-25.8,5-33.4-5.9L192,385.8l-36.3,51.9c-7.6,10.9-22.6,13.5-33.4,5.9s-13.5-22.6-5.9-33.4
	l46.3-66.2l-46.4-66.2c-7.6-10.9-5-25.8,5.9-33.4S148,239.4,155.7,250.2L155.7,250.2z"
        />
      </svg>
    )
  )
);
FileTable.displayName = 'FileTableIcon';
