import './index.scss';
import './i18n';
import Matomo from 'matomo-ts';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { App } from './component/App';
import { Authentication } from './component/Authentication';
import { client } from 'api/client';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { theme } from './theme';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { de } from 'date-fns/locale';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './i18n';
import * as Sentry from '@sentry/react';
import * as serviceWorker from './serviceWorker';

if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.REACT_APP_APP_ENVIRONMENT,
        beforeSend: (event, hint) => {
            if ((hint?.originalException as Error)?.message?.match(/graphql/i)) {
                event.fingerprint = ['graphql'];
            }
            return event;
        }
    });
}

Matomo.default().init(
    '/',
    document.location.hostname,
    {
        async: true,
        srcUri: '/matana.js'
    }
);
Matomo.default().push(['setTrackerUrl', '/matanb']);

(async () => {
    ReactDOM.render(
        (
            <I18nextProvider i18n={i18n}>
                <Sentry.ErrorBoundary showDialog dialogOptions={{ lang: 'de' }}>
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                            <CloudimageProvider config={{ token: process.env.REACT_APP_CLOUDIMG_TOKEN }}>
                                <Authentication>
                                    <ApolloProvider client={client}>
                                        <UploadQueueProvider>
                                            <App />
                                        </UploadQueueProvider>
                                    </ApolloProvider>
                                </Authentication>
                            </CloudimageProvider>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                </Sentry.ErrorBoundary>
            </I18nextProvider>
        ),
        document.getElementById('root')
    );
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
