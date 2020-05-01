import React, { FunctionComponent, memo, useCallback, useEffect } from 'react';
import { Grid, makeStyles, Theme, Drawer } from '@material-ui/core';
import { useIsMobile } from 'util/useIsMobile';
import { useQuery, useApolloClient } from '@apollo/client';
import useRouter from 'use-react-router';
import { gql } from '@apollo/client';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        [theme.breakpoints.down('md')]: {
            paddingLeft: 0,
        },
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0.5em',
        },
    },
}));
export const BaseLayoutSidebar: FunctionComponent = memo(({ children }) => {
    const styles = useStyles();

    const isMobile = useIsMobile();
    const client = useApolloClient();
    const { data } = useQuery<{ isMobileDrawerOpen: boolean }>(gql`{ isMobileDrawerOpen @client }`);
    const isMobileDrawerOpen = !!data?.isMobileDrawerOpen;
    const closeDrawer = useCallback(() => {
        client.writeQuery({
            query: gql`{ isMobileDrawerOpen }`,
            data: { isMobileDrawerOpen: false }
        });
    }, [client]);

    const { location: { pathname } } = useRouter();

    useEffect(() => {
        closeDrawer()
    }, [closeDrawer, pathname]);

    if (isMobile) {
        return (
            <Drawer anchor={'right'} open={isMobileDrawerOpen} onClose={() => closeDrawer()}>
                {children}
            </Drawer>
        );
    } else {
        return (
            <Grid className={styles.root} item component={'aside'} xs={12} md={3} xl={3}>
                {children}
            </Grid>
        );
    }
});