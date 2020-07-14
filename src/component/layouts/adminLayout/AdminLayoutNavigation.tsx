import React, { memo } from 'react';
import { Paper, Tabs, Tab } from '@material-ui/core';
import useRouter from 'use-react-router';

export const AdminLayoutNavigation = memo(() => {
    const { history, location } = useRouter();
    return (
        <Paper>
            <Tabs
                value={location.pathname.split('/').slice(0, 3).join('/')}
                onChange={(_, value) => {
                    const destination = ((basePath: string) => {
                        switch (basePath) {
                            case '/admin/tenant':
                                return '/admin/tenant/general';
                            case '/admin/users':
                                return '/admin/users/list';
                            case '/admin/categories':
                                return '/admin/categories/list';
                            default:
                                return basePath;
                        }
                    })(value);
                    history.push(destination);
                }}
                orientation="vertical"
                variant="scrollable"
                aria-label="Admin Einstellungen"
            >
                <Tab label="Mein Lotta" value={'/admin/tenant'} />
                <Tab label="Nutzer &amp; Gruppen" value={'/admin/users'} />
                <Tab label="Kategorien &amp; Marginalen" value={'/admin/categories'} />
                <Tab label="Freizugebende Beiträge" value={'/admin/unpublished'} />
            </Tabs>
        </Paper>
    );
});
