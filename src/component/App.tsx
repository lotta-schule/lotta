import React, { memo, Suspense, lazy } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { CircularProgress } from '@material-ui/core';
import { ClientModel } from 'model';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useQuery } from '@apollo/client';
import { theme } from 'theme';
import { useCategories } from 'util/categories/useCategories';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { AppHead } from './AppHead';
import { EmptyLoadingLayout } from './layouts/EmptyLoadingLayout';
import { BaseLayout } from './layouts/BaseLayout';
import { GetSystemQuery } from 'api/query/GetSystemQuery';
import merge from 'lodash/merge';

const AdminLayout = lazy(() => import('./layouts/adminLayout/AdminLayout'));
const ArticleRoute = lazy(() => import('./routes/ArticleRoute'));
const CategoryRoute = lazy(() => import('./routes/CategoryRoute'));
const EditArticleRoute = lazy(() => import('./routes/EditArticleRoute'));
const SearchLayout = lazy(() => import('./layouts/SearchLayout'));
const PrivacyLayout = lazy(() => import('./layouts/PrivacyLayout'));
const ProfileLayout = lazy(() => import('./layouts/profileLayout/ProfileLayout'));
const ResetPasswordLayout = lazy(() => import('./layouts/ResetPasswordLayout'));
const RequestPasswordResetLayout = lazy(() => import('./layouts/RequestPasswordResetLayout'));

export const App = memo(() => {
    const { data, loading: isLoadingSystem, error, called: calledSystem } = useQuery<{ system: ClientModel }>(GetSystemQuery);
    const [, { called: calledCurrentUser, loading: isLoadingCurrentUser }] = useCurrentUser();
    useCategories();

    if (!calledSystem || !calledCurrentUser || isLoadingSystem || isLoadingCurrentUser) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    const { system } = data!;

    return (
        <ThemeProvider theme={() => {
            if (system.customTheme) {
                return createMuiTheme(merge({}, theme, system.customTheme), deDE);
            }
            return theme;
        }}>
            <BrowserRouter>
                <AppHead />
                <Suspense fallback={<EmptyLoadingLayout />}>
                    <BaseLayout>
                        <Switch>
                            <Route exact path={'/'} component={CategoryRoute} />
                            <Route path={'/c/:id'} component={CategoryRoute} />
                            <Route path={'/category/:id'} component={CategoryRoute} />
                            <Route path={'/a/:id/edit'} component={EditArticleRoute} />
                            <Route path={'/a/:id'} component={ArticleRoute} />
                            <Route path={'/article/:id/edit'} component={EditArticleRoute} />
                            <Route path={'/article/:id'} component={ArticleRoute} />
                            <Route path={'/search'} component={SearchLayout} />
                            <Route path={'/profile'} component={ProfileLayout} />
                            <Route path={'/admin'} component={AdminLayout} />
                            <Route path={'/privacy'} component={PrivacyLayout} />

                            <Route path={'/password/request-reset'} component={RequestPasswordResetLayout} />
                            <Route path={'/password/reset'} component={ResetPasswordLayout} />
                            <Route component={() => <div>Nicht gefunden</div>} />
                        </Switch>
                    </BaseLayout>
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
});
