import React, { FunctionComponent, memo, useCallback } from 'react';
import { Grid, makeStyles, Theme, Drawer } from '@material-ui/core';
import { UserNavigation } from './navigation/UserNavigation';
import { useIsMobile } from 'util/useIsMobile';
import { UserNavigationMobile } from './navigation/UserNavigationMobile';
import { useSelector, useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';
import { State } from 'store/State';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        [theme.breakpoints.down('md')]: {
            marginLeft: 0,
            marginTop: '0.5em',
        },
        [theme.breakpoints.up('md')]: {
            marginLeft: '0.5em',
        },
    },
}));
export const BaseLayoutSidebar: FunctionComponent = memo(({ children }) => {
    const styles = useStyles();
    const isMobile = useIsMobile();
    const isMobileDrawerOpen = useSelector<State, boolean>(s => s.layout.isDrawerOpen);
    const dispatch = useDispatch();
    const closeDrawer = useCallback(() => { dispatch(createCloseDrawerAction()); }, [dispatch]);

    if (isMobile) {
        return (
            <>
                <UserNavigationMobile />
                <Drawer anchor={'right'} open={isMobileDrawerOpen} onClose={() => closeDrawer()}>
                    <UserNavigation />
                    {children}
                </Drawer>
            </>
        );
    } else {
        return (
            <Grid className={styles.root} item component={'aside'} xs={12} md={3} xl={3} >
                <UserNavigation />
                {children}
            </Grid>
        );
    }
});