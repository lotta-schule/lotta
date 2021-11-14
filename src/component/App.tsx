import * as React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { TenantModel } from 'model';
import { theme } from '../theme';
import { AppHead } from './AppHead';
import { BaseLayout } from './layouts/BaseLayout';
import { CssVariables } from './CssVariables';
import merge from 'lodash/merge';

export interface AppProps {
    tenant: TenantModel;
}

export const App: React.FC<AppProps> = ({ tenant, children }) => {
    return (
        <ThemeProvider
            theme={() => {
                if (tenant.configuration.customTheme) {
                    return createMuiTheme(
                        merge({}, theme, tenant.configuration.customTheme),
                        deDE
                    );
                }
                return theme;
            }}
        >
            <CssVariables />
            <AppHead />
            <BaseLayout>{children}</BaseLayout>
        </ThemeProvider>
    );
};
