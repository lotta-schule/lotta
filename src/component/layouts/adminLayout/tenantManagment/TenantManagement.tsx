import React, { memo } from 'react';
import { Paper, Theme, Tab, Tabs, makeStyles } from '@material-ui/core';
import { Switch, Route, Redirect } from 'react-router-dom';
import { BasicSettings } from './basic/BasicSettings';
import { PresentationSettings } from './presentation/PresentationSettings';
import { UsageOverview } from './usage/UsageOverview';
import useRouter from 'use-react-router';

const useStyles = makeStyles((theme: Theme) => ({
    content: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    }
}));

export const TenantManagement = memo(() => {
    const styles = useStyles();
    const { history, location } = useRouter();

    return (
        <Paper>
            <Tabs value={location.pathname} indicatorColor={'primary'} textColor={'primary'} onChange={(_, pathname) => history.push(pathname)}>
                <Tab value={'/admin/tenant/general'} label={'Grundeinstellungen'} />
                <Tab value={'/admin/tenant/presentation'} label={'Darstellung'} />
                <Tab value={'/admin/tenant/usage'} label={'Nutzung'} />
            </Tabs>
            <section className={styles.content}>
                <Switch>
                    <Route exact path='/admin/tenant'>
                        <Redirect to={'/admin/tenant/general'} />
                    </Route>
                    <Route path='/admin/tenant/general' component={BasicSettings} />
                    <Route path='/admin/tenant/presentation' component={PresentationSettings} />
                    <Route path='/admin/tenant/usage' component={UsageOverview} />
                </Switch>
            </section>
        </Paper>
    );
});
