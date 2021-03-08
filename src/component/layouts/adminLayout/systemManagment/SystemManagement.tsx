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
    },
}));

export const SystemManagement = memo(() => {
    const styles = useStyles();
    const { history, location } = useRouter();

    return (
        <Paper>
            <Tabs
                value={location.pathname}
                indicatorColor={'primary'}
                textColor={'primary'}
                onChange={(_, pathname) => history.push(pathname)}
            >
                <Tab
                    value={'/admin/system/general'}
                    label={'Grundeinstellungen'}
                />
                <Tab
                    value={'/admin/system/presentation'}
                    label={'Darstellung'}
                />
                <Tab value={'/admin/system/usage'} label={'Nutzung'} />
            </Tabs>
            <section className={styles.content}>
                <Switch>
                    <Route exact path="/admin/system">
                        <Redirect to={'/admin/system/general'} />
                    </Route>
                    <Route
                        path="/admin/system/general"
                        component={BasicSettings}
                    />
                    <Route
                        path="/admin/system/presentation"
                        component={PresentationSettings}
                    />
                    <Route
                        path="/admin/system/usage"
                        component={UsageOverview}
                    />
                </Switch>
            </section>
        </Paper>
    );
});
