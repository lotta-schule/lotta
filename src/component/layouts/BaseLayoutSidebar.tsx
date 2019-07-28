import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { UserNavigation } from './navigation/UserNavigation';

const useStyles = makeStyles(theme => ({
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

    return (
    <Grid className={styles.root} item component={'aside'} xs={12} md={3} xl={3} >
        <UserNavigation />
        {children}
    </Grid>
)});