import React, { FunctionComponent } from 'react';
import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing';
import { apolloMocks } from './mocks/apollo';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from '@material-ui/styles';
import { theme } from '../theme';
import { Provider } from 'react-redux';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { de } from 'date-fns/locale';
import DateFnsUtils from '@date-io/date-fns';
import store from '../store/Store';

const AllTheProviders: FunctionComponent<{ children?: any; }> = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                <Provider store={store}>
                    <MockedProvider mocks={apolloMocks}>
                        <Router history={createBrowserHistory()}>
                            {children}
                        </Router>
                    </MockedProvider>
                </Provider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    )
}

const customRender = (ui: React.ReactElement, options: Omit<RenderOptions, 'queries'> = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }