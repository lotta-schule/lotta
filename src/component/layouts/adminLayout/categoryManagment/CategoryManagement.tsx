import React, { memo } from 'react';
import { Paper, Tabs, Tab, makeStyles } from '@material-ui/core';
import { Switch, Route, Redirect } from 'react-router-dom';
import { CategoriesManagement } from './categories/CategoriesManagement';
import { WidgetsManagement } from './widgets/WidgetsManagement';
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

export const CategoryManagement = memo(() => {
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
                <Tab value={'/admin/categories/list'} label={'Kategorien'} />
                <Tab value={'/admin/categories/widgets'} label={'Marginalen'} />
            </Tabs>
            <section className={styles.content}>
                <Switch>
                    <Route exact path="/admin/categories">
                        <Redirect to={'/admin/categories/list'} />
                    </Route>
                    <Route
                        path="/admin/categories/list"
                        component={CategoriesManagement}
                    />
                    <Route
                        path="/admin/categories/widgets"
                        component={WidgetsManagement}
                    />
                </Switch>
            </section>
        </Paper>
    );
});
