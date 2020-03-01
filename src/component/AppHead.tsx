import React, { memo } from 'react';
import { useTenant } from 'util/client/useTenant';
import { useTheme } from '@material-ui/core';
import { Helmet } from 'react-helmet';

export const AppHead = memo(() => {
    const tenant = useTenant();
    const theme = useTheme();
    return (
        <Helmet>
            <title>{tenant.title}</title>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
            <link rel="mask-icon" href={`${process.env.PUBLIC_URL}/favicon/safari-pinned-tab.svg`} color={theme.palette.primary.main} />
            <meta name="theme-color" content={theme.palette.primary.main} />
            <meta name="apple-mobile-web-app-title" content={tenant.title} />
            <meta name="application-name" content={tenant.title} />
        </Helmet>
    );
});