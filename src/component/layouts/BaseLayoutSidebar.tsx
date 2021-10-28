import * as React from 'react';
import { Grid, Drawer } from '@material-ui/core';
import { useIsMobile } from 'util/useIsMobile';
import { useQuery, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { Footer } from './navigation/Footer';
import { WidgetsList } from './WidgetsList';
import { useRouter } from 'next/router';

import styles from './BaseLayoutSidebar.module.scss';

export interface BaseLayoutSidebarProps {
    isEmpty?: boolean;
    children?: any;
}

export const BaseLayoutSidebar = React.memo<BaseLayoutSidebarProps>(
    ({ children, isEmpty }) => {
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
                    classes={{ paper: styles.drawer }}
                    anchor={'right'}
                    open={isMobileDrawerOpen}
                    onClose={() => closeDrawer()}
                >
                    {isEmpty ? <WidgetsList widgets={[]} /> : children}
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
    }
);
BaseLayoutSidebar.displayName = 'BaseLayoutSidebar';
