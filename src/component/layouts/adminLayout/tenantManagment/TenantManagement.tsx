import React, { memo } from 'react';
import { makeStyles, Theme, Paper } from '@material-ui/core';
import { BasicTenantSettings } from './BasicTenantSettings';
import { ColorSettings } from './ColorSettings';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    divider: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2),
    }
}));

export const TenantManagement = memo(() => {
    const styles = useStyles();

    return (
        <Paper className={styles.root}>
            <BasicTenantSettings />
            <Divider className={styles.divider} />
            <ColorSettings />
        </Paper>
    );
});