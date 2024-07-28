import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileArchive = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 384 512"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="file-archive-icon"
      {...props}
    >
      <path
        fill="#ADADAD"
        d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M96,48c0-8.8,7.2-16,16-16h32c8.8,0,16,7.2,16,16s-7.2,16-16,16h-32C103.2,64,96,56.8,96,48z M96,112
	c0-8.8,7.2-16,16-16h32c8.8,0,16,7.2,16,16s-7.2,16-16,16h-32C103.2,128,96,120.8,96,112z M96,176c0-8.8,7.2-16,16-16h32
	c8.8,0,16,7.2,16,16s-7.2,16-16,16h-32C103.2,192,96,184.8,96,176z M89.7,247.8c3.7-14,16.4-23.8,30.9-23.8h14.8
	c14.5,0,27.2,9.7,30.9,23.8l23.5,88.2c1.4,5.4,2.1,10.9,2.1,16.4c0,35.2-28.8,63.7-64,63.7s-64-28.5-64-63.7
	c0-5.5,0.7-11.1,2.1-16.4l23.5-88.2H89.7z M112,336c-8.8,0-16,7.2-16,16s7.2,16,16,16h32c8.8,0,16-7.2,16-16s-7.2-16-16-16H112z"
      />
    </svg>
  )
);
FileArchive.displayName = 'FileArchiveIcon';
