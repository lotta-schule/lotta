import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileImage = React.memo(
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
          fill="#FFB900"
          d="M0,135.6C0,92.8,28.7,58,64,58h384c35.3,0,64,34.8,64,77.6v387.9c0,42.8-28.7,77.6-64,77.6H64
	c-35.3,0-64-34.8-64-77.6V135.6z M323.8,264.7c-4.5-8-11.9-12.7-19.8-12.7s-15.4,4.7-19.8,12.7l-87,154.7l-26.5-40.1
	c-4.6-6.9-11.5-10.9-18.7-10.9s-14.2,4-18.7,10.9l-64,97c-5.8,8.7-6.9,20.7-2.9,30.8c4,10.1,12.4,16.5,21.6,16.5h96h32h208
	c8.9,0,17.1-5.9,21.2-15.5c4.1-9.6,3.6-21.1-1.4-29.9L323.8,264.7L323.8,264.7z M112,251.9c26.5,0,48-26,48-58.2s-21.5-58.2-48-58.2
	s-48,26-48,58.2S85.5,251.9,112,251.9z"
        />
      </svg>
    )
  )
);
FileImage.displayName = 'FileImageIcon';
