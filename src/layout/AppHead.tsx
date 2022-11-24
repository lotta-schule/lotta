import * as React from 'react';
import Head from 'next/head';
import { useTheme } from '@lotta-schule/hubert';
import { useTenant } from 'util/tenant/useTenant';

export const AppHead = React.memo(() => {
    const tenant = useTenant();
    const theme = useTheme();

    const title = tenant.title;
    return (
        <Head>
            <title>{title}</title>
            {/* viewport meta tags are not allowed in _document */}
            {/* see https://nextjs.org/docs/messages/no-document-viewport-meta */}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1"
            />
            <link
                rel="mask-icon"
                href={`/favicon/safari-pinned-tab.svg`}
                color={theme.primaryColor}
            />
            <meta name="theme-color" content={theme.primaryColor} />
            <meta name="apple-mobile-web-app-title" content={title} />
            <meta name="application-name" content={title} />
        </Head>
    );
});
AppHead.displayName = 'AppHead';
