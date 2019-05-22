import { CategoryLayout } from './layouts/CategoryLayout';
import { ThemeProvider } from '@material-ui/styles';
import { PageLayout } from './layouts/PageLayout';
import { Provider } from 'react-redux';
import { Route, BrowserRouter, Switch, RouteComponentProps } from 'react-router-dom';
import { theme } from '../theme';
import React, { memo, FunctionComponent } from 'react';
import { ConnectedEditArticleLayout } from './layouts/ConnectedEditArticleLayout';
import store from '../store/Store';
import { ConnectedBaseLayout } from './layouts/ConnectedBaseLayout';

export const App: FunctionComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path={'/'} component={() => (<ConnectedBaseLayout>Nicht gefunden</ConnectedBaseLayout>)} />
            <Route exact path={'/'} component={memo(() => (
              <CategoryLayout
                category={null!}
                articles={store.getState().content.articles.filter(article => !article.category)}
              />
            ))} />
            <Route path={'/category/:id'} component={memo<RouteComponentProps<{ id: string }>>(({ match }) => (
              <CategoryLayout
                category={store.getState().content.categories.find(category => category.id === match.params.id)!}
                articles={store.getState().content.articles.filter(article => !!article.category && article.category.id === match.params.id)}
              />
            ))} />
            <Route path={'/page/:id'} component={memo<RouteComponentProps<{ id: string }>>(({ match }) => (
              <PageLayout
                title={match.params.id}
                articles={store.getState().content.articles.filter(article => (
                  article.pageName === match.params.id || article.id === match.params.id
                ))}
              />
            ))} />
            <Route path={'/article/:id'} component={memo<RouteComponentProps<{ id: string }>>(({ match }) => <ConnectedEditArticleLayout articleId={match.params.id} />)} />
            <Route component={() => <div>Nicht gefunden</div>} />
          </Switch>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}
