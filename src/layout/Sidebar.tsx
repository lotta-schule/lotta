import * as React from 'react';
import { Grid, Drawer, NoSsr } from '@material-ui/core';
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
                /* disable all fancy pancy a11y features because it breaks when 
                    we want to use our own fancy pancy a11y features for nested dialogs */
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                disableEscapeKeyDown
                data-testid={'BaseLayoutSidebar'}
                classes={{ paper: styles.drawer }}
                anchor={'right'}
                open={isMobileDrawerOpen}
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
            <Grid
                data-testid="BaseLayoutSidebar"
                className={styles.root}
                item
                component={'aside'}
                xs={12}
                md={3}
                xl={3}
            >
                {children}
                <Footer />
            </Grid>
        );
    }
});
Sidebar.displayName = 'BaseLayoutSidebar';
