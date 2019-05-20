import { CategoryLayout } from './layouts/CategoryLayout';
import { ThemeProvider } from '@material-ui/styles';
import { PageLayout } from './layouts/PageLayout';
import { Provider } from 'react-redux';
import { Route, BrowserRouter, Redirect, Switch, RouteComponentProps } from 'react-router-dom';
import { theme } from '../theme';
import React, { memo, FunctionComponent } from 'react';
import { ConnectedEditArticleLayout } from './layouts/ConnectedEditArticleLayout';
import store from '../store/Store';

export const App: FunctionComponent = () => {
  const CategoryPage = () => <CategoryLayout category={store.getState().content.categories[0]} articles={store.getState().content.articles} />;
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path={'/'} component={CategoryPage} />
            <Route path={'/article/:id'} component={memo<RouteComponentProps<{ id: string }>>(({ match }) => <ConnectedEditArticleLayout articleId={match.params.id} />)} />
            <Route path={'/category'} component={CategoryPage} />
            <Route path={'/page/:id'} component={memo<RouteComponentProps<{ id: string }>>(({ match }) => (
              <PageLayout
                title={match.params.id}
                articles={store.getState().content.articles.filter(article => (
                  article.pageName === match.params.id || article.id === match.params.id
                ))}
              />
            ))} />
            <Redirect to={'/category'} />
          </Switch>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}
