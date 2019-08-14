import React, { FunctionComponent, memo } from 'react';
import { Paper, Tabs, Tab, makeStyles } from '@material-ui/core';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(1),
    }
}));

export const Navigation: FunctionComponent = memo(() => {
    const { history } = useRouter();
    const styles = useStyles();
    return (
        <Paper className={styles.root}>
            <Tabs
                value={0}
                orientation="vertical"
                variant="scrollable"
                aria-label="Admin Einstellungen"
            >
                <Tab label="Mein Lotta" onClick={() => history.push('/admin')} />
                <Tab label="Nutzerverwaltung" onClick={() => history.push('/admin/users')} />
                <Tab label="Kategorienverwaltung" onClick={() => history.push('/admin/categories')} />
            </Tabs>
        </Paper>
    );
});