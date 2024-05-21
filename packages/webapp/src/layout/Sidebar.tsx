import * as React from 'react';
import { Drawer, NoSsr, useIsMobile } from '@lotta-schule/hubert';
import { useReactiveVar } from '@apollo/client';
import { Footer } from './navigation/Footer';
import { WidgetsList } from 'category/widgetsList/WidgetsList';
import { isMobileDrawerOpenVar } from 'api/apollo/cache';
import { useRouter } from 'next/router';

import styles from './Sidebar.module.scss';

export interface SidebarProps {
  isEmpty?: boolean;
  children?: any;
}

export const Sidebar = React.memo<SidebarProps>(({ children, isEmpty }) => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const isMobileDrawerOpen = useReactiveVar(isMobileDrawerOpenVar);
  const closeMobileDrawer = () => isMobileDrawerOpenVar(false);

  React.useEffect(() => {
    closeMobileDrawer();
  }, [router.pathname]);

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
  } else if (isEmpty) {
    // there must be a relative container for footer positioning
    return (
      <div
        data-testid="BaseLayoutSidebar"
        style={{ position: 'relative', width: 0 }}
      >
        <Footer />
      </div>
    );
  } else {
    return (
      <aside data-testid="BaseLayoutSidebar" className={styles.root}>
        {children}
        <Footer />
      </aside>
    );
  }
});
Sidebar.displayName = 'BaseLayoutSidebar';
