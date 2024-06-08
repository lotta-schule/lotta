'use client';

import * as React from 'react';
import clsx from 'clsx';

import styles from './Collapse.module.scss';

export type CollapseProps = React.HTMLProps<HTMLDivElement> & {
  isOpen: boolean;
};

export const Collapse = ({
  isOpen,
  className,
  children,
  ...props
}: CollapseProps) => {
  return (
    <div
      {...props}
      aria-hidden={!isOpen}
      className={clsx(className, styles.root)}
    >
      <div>{children}</div>
    </div>
  );
};
