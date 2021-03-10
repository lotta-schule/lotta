import React, { memo } from 'react';
import { Paper, Tabs, Tab, makeStyles } from '@material-ui/core';
import { Switch, Route, Redirect } from 'react-router-dom';
import { UsersList } from './UsersList';
import { GroupsList } from './GroupsList';
import { Constraints } from './Constraints';
import useRouter from 'use-react-router';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '85vh',
    },
    content: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
}));

export const UserManagement = memo(() => {
    const styles = useStyles();
    const { history, location } = useRouter();

    return (
        <Paper className={styles.root}>
            <Tabs
                value={location.pathname}
                indicatorColor={'primary'}
                textColor={'primary'}
                onChange={(_, pathname) => history.push(pathname)}
            >
                <Tab value={'/admin/users/list'} label={'Nutzer'} />
                <Tab value={'/admin/users/groups'} label={'Gruppen'} />
                <Tab
                    value={'/admin/users/constraints'}
                    label={'Einstellungen'}
                />
            </Tabs>
            <section className={styles.content}>
                <Switch>
                    <Route exact path="/admin/users">
                        <Redirect to={'/admin/users/list'} />
                    </Route>
                    <Route path="/admin/users/list" component={UsersList} />
                    <Route path="/admin/users/groups" component={GroupsList} />
                    <Route
                        path="/admin/users/constraints"
                        component={Constraints}
                    />
                </Switch>
            </section>
        </Paper>
    );
});
