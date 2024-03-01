import * as React from 'react';
import clsx from 'clsx';

import styles from './SplitView.module.scss';

export type SplitViewContentProps = {
  children: React.ReactNode;
};

export const SplitViewContent = ({ children }: SplitViewContentProps) => {
  return <div className={clsx(styles.contentView)}>{children}</div>;
};
