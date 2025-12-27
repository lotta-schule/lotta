'use client';
import * as React from 'react';
import { Drawer, NoSsr, useIsMobile } from '@lotta-schule/hubert';
import { useReactiveVar } from '@apollo/client/react';
import { Footer } from './navigation/Footer';
import { WidgetsList } from 'category/widgetsList/WidgetsList';
import { isMobileDrawerOpenVar } from 'api/apollo/cache';
import { usePathname } from 'next/navigation';

import styles from './Sidebar.module.scss';
import clsx from 'clsx';

export interface SidebarProps {
  isEmpty?: boolean;
  children?: any;
}

export const Sidebar = React.memo<SidebarProps>(({ children, isEmpty }) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isMobileDrawerOpen = useReactiveVar(isMobileDrawerOpenVar);
  const closeMobileDrawer = () => isMobileDrawerOpenVar(false);

  React.useEffect(() => {
    closeMobileDrawer();
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
