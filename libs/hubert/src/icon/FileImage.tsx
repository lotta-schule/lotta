import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileImage = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      viewBox="0 0 384 512"
      aria-hidden="true"
      className={clsx(styles.root, className)}
      data-testid="file-image-icon"
      {...props}
    >
      <path
        fill="#FFCC00"
        d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M64,256c0-17.7,14.3-32,32-32s32,14.3,32,32s-14.3,32-32,32S64,273.7,64,256z M216,288
	c5.3,0,10.2,2.6,13.2,6.9l88,128c3.4,4.9,3.7,11.3,1,16.5S310,448,304,448h-88h-40h-48H80c-5.8,0-11.1-3.1-13.9-8.1
	s-2.8-11.2,0.2-16.1l48-80c2.9-4.8,8.1-7.8,13.7-7.8s10.8,2.9,13.7,7.8l12.8,21.4l48.3-70.2c3-4.3,7.9-6.9,13.2-6.9V288z"
      />
    </svg>
  )
);
FileImage.displayName = 'FileImageIcon';
