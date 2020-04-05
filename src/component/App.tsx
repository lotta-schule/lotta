import React, { memo } from 'react';
import { merge } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
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
import { useQuery } from '@apollo/react-hooks';
import { theme } from 'theme';
import { useCategories } from 'util/categories/useCategories';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { AppHead } from './AppHead';

export const App = memo(() => {
    const { data, loading: isLoadingTenant, error, called: calledTenant } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);
    const [, { called: calledCurrentUser, loading: isLoadingCurrentUser }] = useCurrentUser();
    useCategories();

    if (!calledTenant || !calledCurrentUser || isLoadingTenant || isLoadingCurrentUser) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }

    if (calledTenant && (!data || !data.tenant)) {
        return (
            <ErrorMessage error={new Error('Adresse ungültig')} />
        );
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    const { tenant } = data!;

    return (
        <ThemeProvider theme={() => {
            if (tenant.customTheme) {
                return createMuiTheme(merge({}, theme, tenant.customTheme), deDE);
            }
            return theme;
        }}>
            <BrowserRouter>
                <AppHead />
                <BaseLayout>
                    <Switch>
                        <Route exact path={'/'} component={CategoryRoute} />
                        <Route path={'/c/:id'} component={CategoryRoute} />
                        <Route path={'/category/:id'} component={CategoryRoute} />
                        <Route path={'/a/:id/edit'} component={EditArticleRoute} />
                        <Route path={'/a/:id'} component={ArticleRoute} />
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
