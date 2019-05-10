import { EditArticleLayout } from './layouts/EditArticleLayout';
import { CategoryLayout } from './layouts/CategoryLayout';
import { createBrowserHistory } from "history";
import { MuiThemeProvider } from '@material-ui/core';
import { PageLayout } from './layouts/PageLayout';
import { Provider } from 'react-redux';
import { Router, Route, Redirect, Switch, RouteComponentProps } from 'react-router';
import { theme } from '../theme';
import React, { memo } from 'react';
import store from '../store/Store';

function App() {
  const ArticlePage = () => <EditArticleLayout article={store.getState().content.articles[0]} />;
  const CategoryPage = () => <CategoryLayout category={store.getState().content.categories[0]} articles={store.getState().content.articles} />;
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={createBrowserHistory()}>
          <Switch>
            <Route path="/article" component={ArticlePage} />
            <Route path="/category" component={CategoryPage} />
            <Route path="/page/:pageId" component={memo<RouteComponentProps<{ pageId: string }>>(({ match }) => (
              <PageLayout
                title={match.params.pageId}
                articles={store.getState().content.articles.filter(article => (
                  article.pageName === match.params.pageId || article.id === match.params.pageId
                ))}
              />
            ))} />
            <Redirect to={'/category'} />
          </Switch>
        </Router>
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
