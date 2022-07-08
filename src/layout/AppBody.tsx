import * as React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { theme } from '../theme';
import { BaseLayout } from './BaseLayout';
import { useTenant } from 'util/tenant/useTenant';
import merge from 'lodash/merge';

export const AppBody: React.FC = ({ children }) => {
    // TODO: This custom theme will be thrown out entirely when
    // we ditch material-ui
    const tenant = useTenant();
    return (
        <ThemeProvider
            theme={() => {
                if (tenant.configuration.customTheme) {
                    return createTheme(
                        merge({}, theme, tenant.configuration.customTheme),
                        deDE
                    );
                }
                return theme;
            }}
        >
            <BaseLayout>{children}</BaseLayout>
        </ThemeProvider>
    );
};
