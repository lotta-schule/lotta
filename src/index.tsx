import './index.scss';
import './i18n';
import Honeybadger from 'honeybadger-js';
import Matomo from 'matomo-ts';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { ApolloProvider } from '@apollo/client';
import { App } from './component/App';
import { client } from 'api/client';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { theme } from './theme';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { de } from 'date-fns/locale';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './i18n';

if (process.env.REACT_APP_MATOMO_URL) {
    Matomo.default().init(
        process.env.REACT_APP_MATOMO_URL,
        document.location.hostname,
        {
            async: true,
            srcUri: `${process.env.REACT_APP_MATOMO_URL}/matomo.js`
        }
    );
}

try {
    Honeybadger.configure({
        apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY,
        environment: process.env.REACT_APP_APP_ENVIRONMENT,
        revision: process.env.REACT_APP_APP_REVISION
    });
} catch (e) {
    console.error(e);
}


ReactDOM.render(
    (

        <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                    <CloudimageProvider config={{ token: process.env.REACT_APP_CLOUDIMG_TOKEN }}>
                        <ApolloProvider client={client}>
                            <UploadQueueProvider>
                                <App />
                            </UploadQueueProvider>
                        </ApolloProvider >
                    </CloudimageProvider>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </I18nextProvider>
    ),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
