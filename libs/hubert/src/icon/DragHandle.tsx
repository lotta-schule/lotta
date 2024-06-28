import * as React from 'react';
import clsx from 'clsx';

import styles from './SvgIcon.module.scss';

export const DragHandle = React.memo(
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={clsx(styles.root, className)}
        data-testid="drag-handle-icon"
        ref={ref}
        {...(props as any)}
      >
        <title>draggable</title>
        <path d="M2 11h16v2H2zm0-4h16v2H2zm8 11l3-3H7l3 3zm0-16L7 5h6l-3-3z" />
      </svg>
    )
  )
);
DragHandle.displayName = 'DragHandleIcon';
