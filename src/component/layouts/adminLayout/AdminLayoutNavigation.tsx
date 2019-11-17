import React, { memo } from 'react';
import { Paper, Tabs, Tab } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { UserModel } from 'model';
import useRouter from 'use-react-router';

export const AdminLayoutNavigation = memo(() => {
    const { history, location } = useRouter();
    const currentUser = useCurrentUser()[0] as UserModel;
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
                {User.isAdmin(currentUser) && (
                    <Tab label="Freizugebende Beiträge" value={'/admin/unpublished'} />
                )}
            </Tabs>
        </Paper>
    );
});