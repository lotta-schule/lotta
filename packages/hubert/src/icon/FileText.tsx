import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const FileText = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        viewBox="0 0 512 677"
        aria-hidden="true"
        className={clsx(styles.root, className)}
        data-testid="file-text-icon"
        ref={ref}
        {...props}
      >
        <path
          fill="#0049bf"
          d="M64,0C28.7,0,0,28.7,0,64v384c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64V160H256c-17.7,0-32-14.3-32-32V0
	H64z M256,0v128h128L256,0z M112,256h160c8.8,0,16,7.2,16,16s-7.2,16-16,16H112c-8.8,0-16-7.2-16-16S103.2,256,112,256z M112,320
	h160c8.8,0,16,7.2,16,16s-7.2,16-16,16H112c-8.8,0-16-7.2-16-16S103.2,320,112,320z M112,384h160c8.8,0,16,7.2,16,16s-7.2,16-16,16
	H112c-8.8,0-16-7.2-16-16S103.2,384,112,384z"
        />
      </svg>
    )
  )
);
FileText.displayName = 'FileTextIcon';
