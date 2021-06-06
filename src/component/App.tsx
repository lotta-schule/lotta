import * as React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { LinearProgress } from '@material-ui/core';
import { TenantModel } from 'model';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useQuery } from '@apollo/client';
import { theme } from 'theme';
import { useCategories } from 'util/categories/useCategories';
import { AppHead } from './AppHead';
import { EmptyLoadingLayout } from './layouts/EmptyLoadingLayout';
import { BaseLayout } from './layouts/BaseLayout';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { CssVariables } from './CssVariables';
import merge from 'lodash/merge';
import ServerDownImage from './ServerDownImage.svg';
import TenantNotFoundImage from './TenantNotFoundImage.svg';
import styles from './App.module.scss';

const AdminLayout = React.lazy(
    () => import('./layouts/adminLayout/AdminLayout')
);
const ArticleRoute = React.lazy(() => import('./routes/ArticleRoute'));
const CategoryRoute = React.lazy(() => import('./routes/CategoryRoute'));
const EditArticleRoute = React.lazy(() => import('./routes/EditArticleRoute'));
const SearchLayout = React.lazy(() => import('./layouts/SearchLayout'));
const PrivacyLayout = React.lazy(() => import('./layouts/PrivacyLayout'));
const ProfileLayout = React.lazy(
    () => import('./layouts/profileLayout/ProfileLayout')
);
const MessagingLayout = React.lazy(
    () => import('./layouts/messagingLayout/MessagingLayout')
);
const ResetPasswordLayout = React.lazy(
    () => import('./layouts/ResetPasswordLayout')
);
const RequestPasswordResetLayout = React.lazy(
    () => import('./layouts/RequestPasswordResetLayout')
);

export const App = React.memo(() => {
    const {
        data,
        loading: isLoadingTenant,
        error,
        called: calledTenant,
    } = useQuery<{ tenant: TenantModel | null }>(GetTenantQuery);
    const isLoadingCurrentUser = useCurrentUser() === undefined;
    useCategories();

    if (!calledTenant || isLoadingTenant || isLoadingCurrentUser) {
        return (
            <div>
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return (
            <section className={styles.error}>
                <h1>Server nicht erreichbar</h1>
                <div>
                    <img
                        src={ServerDownImage}
                        alt={'Der Server ist nicht erreichbar'}
                    />
                    <p>
                        Der Server hat einen unbekannten Fehler geworfen. Das
                        Team wurde informiert. Versuch es in einigen Minuten
                        nochmal.
                    </p>
                    <p>{error.message}</p>
                </div>
            </section>
        );
    }

    const tenant = data?.tenant;

    if (!tenant) {
        return (
            <section className={styles.error}>
                <h1>Seite nicht gefunden.</h1>
                <div>
                    <img
                        src={TenantNotFoundImage}
                        alt={'Diese Seite existiert nicht'}
                    />
                    <p>
                        Unter dieser Adresse ist aktuell keine lotta-Plattform
                        zu erreichen. Überprüfe die Adresse in der Adressleiste.
                    </p>
                    <p className={styles.secondary}>
                        Sie haben Interesse, ein eigenes lotta unter dieser
                        Adresse anzubieten? Weitere Informationen gibt es auf{' '}
                        <a
                            href="https://lotta.schule"
                            title="Zur Lotta-Projektseite"
                        >
                            lotta.schule
                        </a>
                        .
                    </p>
                </div>
            </section>
        );
    }

    return (
        <ThemeProvider
            theme={() => {
                if (tenant.configuration.customTheme) {
                    return createMuiTheme(
                        merge({}, theme, tenant.configuration.customTheme),
                        deDE
                    );
                }
                return theme;
            }}
        >
            <CssVariables />
            <BrowserRouter>
                <AppHead />
                <React.Suspense fallback={<EmptyLoadingLayout />}>
                    <BaseLayout>
                        <Switch>
                            <Route exact path={'/'} component={CategoryRoute} />
                            <Route path={'/c/:id'} component={CategoryRoute} />
                            <Route
                                path={'/category/:id'}
                                component={CategoryRoute}
                            />
                            <Route
                                path={'/a/:id/edit'}
                                component={EditArticleRoute}
                            />
                            <Route path={'/a/:id'} component={ArticleRoute} />
                            <Route
                                path={'/article/:id/edit'}
                                component={EditArticleRoute}
                            />
                            <Route
                                path={'/article/:id'}
                                component={ArticleRoute}
                            />
                            <Route path={'/search'} component={SearchLayout} />
                            <Route
                                path={'/profile'}
                                component={ProfileLayout}
                            />
                            <Route
                                path={'/messaging'}
                                component={MessagingLayout}
                            />
                            <Route path={'/admin'} component={AdminLayout} />
                            <Route
                                path={'/privacy'}
                                component={PrivacyLayout}
                            />

                            <Route
                                path={'/password/request-reset'}
                                component={RequestPasswordResetLayout}
                            />
                            <Route
                                path={'/password/reset'}
                                component={ResetPasswordLayout}
                            />
                            <Route
                                component={() => <div>Nicht gefunden</div>}
                            />
                        </Switch>
                    </BaseLayout>
                </React.Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
});
