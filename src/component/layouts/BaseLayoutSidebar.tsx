import React, { memo, useCallback, useEffect } from 'react';
import { Grid, makeStyles, Theme, Drawer } from '@material-ui/core';
import { useIsMobile } from 'util/useIsMobile';
import { useQuery, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { Footer } from './navigation/Footer';
import { WidgetsList } from './WidgetsList';
import useRouter from 'use-react-router';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            paddingLeft: 0,
        },
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0.5em',
        },
    },
    drawer: {
        padding: 0,
    },
}));

export interface BaseLayoutSidebarProps {
    isEmpty?: boolean;
    children?: any;
}

export const BaseLayoutSidebar = memo<BaseLayoutSidebarProps>(
    ({ children, isEmpty }) => {
        const styles = useStyles();

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
        const closeDrawer = useCallback(() => {
            client.writeQuery({
                query: gql`
                    {
                        isMobileDrawerOpen
                    }
                `,
                data: { isMobileDrawerOpen: false },
            });
        }, [client]);

        const {
            location: { pathname },
        } = useRouter();

        useEffect(() => {
            closeDrawer();
        }, [closeDrawer, pathname]);

        if (isMobile) {
            return (
                <Drawer
                    data-testid="BaseLayoutSidebar"
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
