import * as React from 'react';
import { useSplitView } from './SplitViewContext';
import clsx from 'clsx';

import styles from './SplitView.module.scss';

export type SplitViewNavigationProps = React.HTMLProps<HTMLDivElement> & {
  children: React.ReactNode | Iterable<React.ReactNode>;
};

export const SPLITVIEW_NAVIGATION_CLASS =
  'hubert-splitview-navigation-component';

export const SplitViewNavigation = ({
  children,
  className,
  ...props
}: SplitViewNavigationProps) => {
  const { isSidebarVisible } = useSplitView();
  return (
    <aside
      {...props}
      aria-hidden={!isSidebarVisible}
      className={clsx(
        className,
        styles.sideView,
        {
          [styles.active]: isSidebarVisible,
        },
        SPLITVIEW_NAVIGATION_CLASS
      )}
    >
      {children}
    </aside>
  );
};
