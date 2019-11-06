import React, { memo } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { ArticleRoute } from './routes/ArticleRoute';
import { BaseLayout } from './layouts/BaseLayout';
import { CategoryRoute } from './routes/CategoryRoute';
import { CircularProgress } from '@material-ui/core';
import { ClientModel } from 'model';
import { EditArticleRoute } from './routes/EditArticleRoute';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { PrivacyLayout } from './layouts/PrivacyLayout';
import { ProfileLayout } from './layouts/ProfileLayout';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-apollo';

export const App = memo(() => {
  const { data, loading: isLoading, error, called } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);

  const [, { called: calledCurrentUser }] = useCurrentUser();

  if (error) {
    return (
      <div><span style={{ color: 'red' }}>{error.message}</span></div>
    );
  }

  if (!called || !calledCurrentUser || isLoading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }

  if (called && (!data || !data.tenant)) {
    return (
      <div>
        <span style={{ color: 'red' }}>Adresse ungültig.</span>
      </div>
    );
  }

  const { tenant } = data!;

  return (
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
          <Route component={() => <div>Nicht gefunden</div>} />
        </Switch>
      </BaseLayout>
    </BrowserRouter>
  );
});