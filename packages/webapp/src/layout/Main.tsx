import * as React from 'react';
import clsx from 'clsx';

import styles from './Main.module.scss';

export interface MainProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | React.ReactNode[];
}

export const Main = ({ className, children, style }: MainProps) => {
  return (
    <main className={clsx(styles.root, className)} style={style}>
      {children}
    </main>
  );
};
Main.displayName = 'BaseLayoutMainContent';
