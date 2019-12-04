import React, { memo } from 'react';
import { merge } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { AdminLayout } from './layouts/adminLayout/AdminLayout';
import { ArticleRoute } from './routes/ArticleRoute';
import { BaseLayout } from './layouts/BaseLayout';
import { CategoryRoute } from './routes/CategoryRoute';
import { CircularProgress } from '@material-ui/core';
import { ClientModel } from 'model';
import { EditArticleRoute } from './routes/EditArticleRoute';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { PrivacyLayout } from './layouts/PrivacyLayout';
import { ProfileLayout } from './layouts/profileLayout/ProfileLayout';
import { ResetPasswordLayout } from './layouts/ResetPasswordLayout';
import { RequestPasswordResetLayout } from './layouts/RequestPasswordResetLayout';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-apollo';
import { theme } from 'theme';
import { useCategories } from 'util/categories/useCategories';

export const App = memo(() => {
    const { data, loading: isLoadingTenant, error, called: calledTenant } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);
    const [, { called: calledCurrentUser, loading: isLoadingCurrentUser }] = useCurrentUser();
    useCategories(); // start loading categories

    if (!calledTenant || !calledCurrentUser || isLoadingTenant || isLoadingCurrentUser) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }

    if (calledTenant && (!data || !data.tenant)) {
        return (
            <div>
                <span style={{ color: 'red' }}>Adresse ungültig.</span>
            </div>
        );
    }

    if (error) {
        return (
            <div><span style={{ color: 'red' }}>{error.message}</span></div>
        );
    }

    const { tenant } = data!;

    return (
        <ThemeProvider theme={() => {
            if (tenant.customTheme) {
                return createMuiTheme(merge({}, theme, tenant.customTheme));
            }
            return theme;
        }}>
            <BrowserRouter>
                <Helmet>
                    <title>{tenant.title}</title>
                    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
                </Helmet>
                <BaseLayout>
                    <Switch>
                        <Route exact path={'/'} component={CategoryRoute} />
                        <Route path={'/category/:id'} component={CategoryRoute} />
                        <Route path={'/article/:id/edit'} component={EditArticleRoute} />
                        <Route path={'/article/:id'} component={ArticleRoute} />
                        <Route path={'/profile'} component={ProfileLayout} />
                        <Route path={'/admin'} component={AdminLayout} />
                        <Route path={'/privacy'} component={PrivacyLayout} />

                        <Route path={'/password/request-reset'} component={RequestPasswordResetLayout} />
                        <Route path={'/password/reset'} component={ResetPasswordLayout} />
                        <Route component={() => <div>Nicht gefunden</div>} />
                    </Switch>
                </BaseLayout>
            </BrowserRouter>
        </ThemeProvider>
    );
});