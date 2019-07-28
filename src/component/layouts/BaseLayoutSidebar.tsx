import React, { FunctionComponent, memo, useState } from 'react';
import { Grid, makeStyles, Theme, Drawer } from '@material-ui/core';
import { UserNavigation } from './navigation/UserNavigation';
import { useIsMobile } from 'util/useIsMobile';
import { UserNavigationMobile } from './navigation/UserNavigationMobile';

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
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    if (isMobile) {
        return (
            <>
                <UserNavigationMobile onToggleMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} />
                <Drawer anchor={'right'} open={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)}>
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