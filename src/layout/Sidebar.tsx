import * as React from 'react';
import { NoSsr } from 'shared/general/util/NoSsr';
import { Drawer } from 'shared/general/drawer/Drawer';
import { useIsMobile } from 'util/useIsMobile';
import { useQuery, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { Footer } from './navigation/Footer';
import { WidgetsList } from 'category/widgetsList/WidgetsList';
import { useRouter } from 'next/router';

import styles from './Sidebar.module.scss';

export interface SidebarProps {
    isEmpty?: boolean;
    children?: any;
}

export const Sidebar = React.memo<SidebarProps>(({ children, isEmpty }) => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const client = useApolloClient();

    const { data } = useQuery<{ isMobileDrawerOpen: boolean }>(
        gql`
            {
                isMobileDrawerOpen @client
            }
        `
    );
    const isMobileDrawerOpen = !!data?.isMobileDrawerOpen;
    const closeDrawer = React.useCallback(() => {
        client.writeQuery({
            query: gql`
                {
                    isMobileDrawerOpen
                }
            `,
            data: { isMobileDrawerOpen: false },
        });
    }, [client]);

    React.useEffect(() => {
        closeDrawer();
    }, [closeDrawer, router.pathname]);

    if (isMobile) {
        return (
            <Drawer
                data-testid={'BaseLayoutSidebar'}
                isOpen={isMobileDrawerOpen}
                onClose={() => closeDrawer()}
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
