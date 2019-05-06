import { ArticleLayout } from './layouts/ArticleLayout';
import { MuiThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import { theme } from '../theme';
import React from 'react';
import store from '../store/Store';
import { Router, Route, Redirect, Switch } from 'react-router';
import { CategoryLayout } from './layouts/CategoryLayout';
import { createBrowserHistory } from "history";

function App() {
  const ArticlePage = () => <ArticleLayout article={store.getState().content.articles[0]} />;
  const CategoryPage = () => <CategoryLayout category={store.getState().content.categories[0]} articles={store.getState().content.articles} />;
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={createBrowserHistory()}>
          <Switch>
            <Route path="/article" component={ArticlePage} />
            <Route path="/category" component={CategoryPage} />
            <Redirect to={'/category'} />
          </Switch>
        </Router>
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
