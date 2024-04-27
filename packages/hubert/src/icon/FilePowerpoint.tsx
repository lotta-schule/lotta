import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FilePowerPoint = React.memo(
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
          fill="#FF5500"
          d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M136,240h68c42,0,76,34,76,76s-34,76-76,76h-44v32c0,13.3-10.7,24-24,24s-24-10.7-24-24v-56V264
	C112,250.7,122.7,240,136,240z M204,344c15.5,0,28-12.5,28-28s-12.5-28-28-28h-44v56H204z"
        />
      </svg>
    )
  )
);
FilePowerPoint.displayName = 'FilePowerPointIcon';
