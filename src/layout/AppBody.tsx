import * as React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { theme } from '../theme';
import { BaseLayout } from './BaseLayout';
import { useTenant } from 'util/tenant/useTenant';
import merge from 'lodash/merge';
import { CssVariables } from './CssVariables';

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
            {/* TODO: Maybe move CssVariables to AppHead as soon as ThemeProvider is not needed anymore */}
            <CssVariables />
            <BaseLayout>{children}</BaseLayout>
        </ThemeProvider>
    );
};
