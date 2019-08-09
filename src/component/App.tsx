import React, { memo, useState } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { ApolloError } from 'apollo-boost';
import { ArticleRoute } from './routes/ArticleRoute';
import { BaseLayout } from './layouts/BaseLayout';
import { CategoryRoute } from './routes/CategoryRoute';
import { CircularProgress } from '@material-ui/core';
import { client as apolloClient } from '../api/client';
import { ClientModel, CategoryModel } from 'model';
import { createSetClientAction, createSetCategoriesAction } from 'store/actions/client';
import { EditArticleRoute } from './routes/EditArticleRoute';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { ProfileLayout } from './layouts/ProfileLayout';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { State } from 'store/State';
import { useSelector, useDispatch } from 'react-redux';

export const App = memo(() => {
  const client = useSelector<State, ClientModel | null>(state => state.client.client);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApolloError | null>(null);
  const dispatch = useDispatch();
  if (!client && !error && !isLoading) {
    apolloClient.query<{ tenant: (ClientModel & { categories: CategoryModel[] }) }>({
      query: GetTenantQuery
    }).then(({ loading, errors, data }) => {
      setIsLoading(loading);
      if (errors) {
        setError(errors[0]);
      }
      const { categories, ...client } = data.tenant;
      dispatch(createSetClientAction(client));
      dispatch(createSetCategoriesAction(categories));
    });
  }

  if (error) {
    return (
      <div><span style={{ color: 'red' }}>{error.message}</span></div>
    );
  }
  if (isLoading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  if (!client) {
    return (
      <div>
        <span>Adresse ungültig.</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <BaseLayout>
        <Switch>
          <Route exact path={'/'} component={CategoryRoute} />
          <Route path={'/category/:id'} component={CategoryRoute} />
          <Route path={'/article/:id/edit'} component={EditArticleRoute} />
          <Route path={'/article/:id'} component={ArticleRoute} />
          <Route path={'/profile'} component={ProfileLayout} />
          <Route path={'/admin'} component={AdminLayout} />
          <Route component={() => <div>Nicht gefunden</div>} />
        </Switch>
      </BaseLayout>
    </BrowserRouter>
  );
});