import React, { FunctionComponent, memo } from 'react';
import { Paper, Tabs, Tab, makeStyles } from '@material-ui/core';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(1),
    }
}));

export const Navigation: FunctionComponent = memo(() => {
    const { history, location } = useRouter();
    const styles = useStyles();
    return (
        <Paper className={styles.root}>
            <Tabs
                value={location.pathname}
                onChange={(_, value) => { history.push(value); }}
                orientation="vertical"
                variant="scrollable"
                aria-label="Admin Einstellungen"
            >
                <Tab label="Mein Lotta" value={'/admin'} />
                <Tab label="Nutzerverwaltung" value={'/admin/users'} />
                <Tab label="Kategorienverwaltung" value={'/admin/categories'} />
                <Tab label="Beitrags-Übersicht" value={'/admin/articles'} />
            </Tabs>
        </Paper>
    );
});