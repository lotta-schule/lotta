import React, { FunctionComponent, memo, useCallback } from 'react';
import { Grid, makeStyles, Theme, Drawer } from '@material-ui/core';
import { UserNavigation } from './navigation/UserNavigation';
import { useIsMobile } from 'util/useIsMobile';
import { useSelector, useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';
import { State } from 'store/State';
import { WidgetsList } from './WidgetsList';

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

    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const isMobileDrawerOpen = useSelector<State, boolean>(s => s.layout.isDrawerOpen);
    const closeDrawer = useCallback(() => { dispatch(createCloseDrawerAction()); }, [dispatch]);

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