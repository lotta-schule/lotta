import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileVideo = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 384 512"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="file-video-icon"
        ref={ref}
        {...props}
      >
        <path
          fill="#5500CE"
          d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M64,288c0-17.7,14.3-32,32-32h96c17.7,0,32,14.3,32,32v96c0,17.7-14.3,32-32,32H96
	c-17.7,0-32-14.3-32-32V288z M300.9,397.9L256,368v-64l44.9-29.9c2-1.3,4.4-2.1,6.8-2.1c6.8,0,12.3,5.5,12.3,12.3v103.4
	c0,6.8-5.5,12.3-12.3,12.3C305.3,400,302.9,399.3,300.9,397.9z"
        />
      </svg>
    )
  )
);
FileVideo.displayName = 'FileVideoIcon';
