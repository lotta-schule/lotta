import './index.scss';
import { ApolloProvider } from 'react-apollo';
import { ConnectedApp } from './component/ConnectedApp';
import { client } from 'api/client';
import { Provider } from 'react-redux';
import { theme } from './theme';
import { ThemeProvider } from '@material-ui/styles';
import * as serviceWorker from './serviceWorker';
import React from 'react';
import ReactDOM from 'react-dom';
import store from './store/Store';

ReactDOM.render(
    (
        <ThemeProvider theme={theme}>
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <ConnectedApp />
                </Provider >
            </ApolloProvider >
        </ThemeProvider >
    ),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
