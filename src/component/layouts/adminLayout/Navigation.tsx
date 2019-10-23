import React, { FunctionComponent, memo } from 'react';
import { Paper, Tabs, Tab } from '@material-ui/core';
import useRouter from 'use-react-router';

export const Navigation: FunctionComponent = memo(() => {
    const { history, location } = useRouter();
    return (
        <Paper>
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
                <Tab label="Widgetverwaltung" value={'/admin/widgets'} />
            </Tabs>
        </Paper>
    );
});