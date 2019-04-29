import { ArticleLayout } from './layouts/ArticleLayout';
import { MuiThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import { theme } from '../theme';
import React from 'react';
import store from '../store/Store';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <ArticleLayout article={store.getState().content.articles[0]} />
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
