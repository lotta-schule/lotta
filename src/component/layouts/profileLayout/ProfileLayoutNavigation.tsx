import React, { memo } from 'react';
import { Paper, Tabs, Tab } from '@material-ui/core';
import useRouter from 'use-react-router';

export const ProfileLayoutNavigation = memo(() => {
    const { history, location } = useRouter();
    return (
        <Paper>
            <Tabs
                value={location.pathname}
                onChange={(_, value) => {
                    history.push(value);
                }}
                orientation="vertical"
                variant="scrollable"
                aria-label="Admin Einstellungen"
            >
                <Tab label="Meine Daten" value={'/profile'} />
                <Tab label="Dateien und Medien" value={'/profile/files'} />
                <Tab label="Meine Beiträge" value={'/profile/articles'} />
            </Tabs>
        </Paper>
    );
});
