'use client';
import * as React from 'react';
import { Drawer, NoSsr, useIsMobile } from '@lotta-schule/hubert';
import { useReactiveVar } from '@apollo/client/react';
import { Footer } from './navigation/Footer';
import { WidgetsList } from '#/category/widgetsList/WidgetsList';
import { isMobileDrawerOpenVar } from '#/api/apollo/cache';
import { usePathname } from 'next/navigation.js';

import styles from './Sidebar.module.scss';
import clsx from 'clsx';

export interface SidebarProps {
  isEmpty?: boolean;
  children?: any;
}

// The last path a sidebar was shown on, shared by all sidebars: every page
// mounts its own sidebar, and on the same page a sidebar can be replaced, e.g.
// when the Suspense boundary around it resolves.
let lastPathname: string | null = null;

export const Sidebar = React.memo<SidebarProps>(({ children, isEmpty }) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isMobileDrawerOpen = useReactiveVar(isMobileDrawerOpenVar);
  const closeMobileDrawer = () => isMobileDrawerOpenVar(false);

  // close the drawer after navigating, but not when a sidebar is replaced on
  // the same page: that would close a drawer the user has just opened
  React.useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname) {
      closeMobileDrawer();
    }
    lastPathname = pathname;
  }, [pathname]);

  if (isMobile) {
    return (
      <Drawer
        data-testid={'BaseLayoutSidebar'}
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
      >
        {isEmpty ? (
          <NoSsr>
            <WidgetsList widgets={[]} />
          </NoSsr>
        ) : (
          children
        )}
        <Footer />
      </Drawer>
    );
  } else {
    return (
      <aside
        data-testid="BaseLayoutSidebar"
        className={clsx({ [styles.isEmpty]: isEmpty }, styles.root)}
        aria-hidden={isEmpty}
      >
        {children}
        <Footer />
      </aside>
    );
  }
});
Sidebar.displayName = 'BaseLayoutSidebar';
