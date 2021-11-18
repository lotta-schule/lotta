import * as React from 'react';
import Head from 'next/head';
import { useTheme } from '@material-ui/core';
import { useTenant } from 'util/tenant/useTenant';
import { CssVariables } from './base/CssVariables';
import {
    textFonts,
    headerFonts,
} from './administration/system/presentation/fonts';

export const AppHead = React.memo(() => {
    const tenant = useTenant();
    const theme = useTheme();

    const allFonts = [...textFonts, ...headerFonts];

    const title = tenant.title;
    return (
        <Head>
            <title>{title}</title>
            {/* viewport meta tags are not allowed in _document */}
            {/* see https://nextjs.org/docs/messages/no-document-viewport-meta */}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link
                rel="mask-icon"
                href={`/favicon/safari-pinned-tab.svg`}
                color={theme.palette.primary.main}
            />
            <meta name="theme-color" content={theme.palette.primary.main} />
            <meta name="apple-mobile-web-app-title" content={title} />
            <meta name="application-name" content={title} />
            <link rel={'preconnect'} href={'https://fonts.gstatic.com'} />

            {[
                theme.typography.fontFamily,
                (theme.overrides as any).LottaArticlePreview.title.fontFamily,
            ].map((fontName, i) => {
                const foundFont = allFonts.find(
                    (font) => font.name === fontName
                );
                if (foundFont) {
                    return (
                        <link key={i} rel={'stylesheet'} href={foundFont.url} />
                    );
                }
                return null;
            })}
        </Head>
    );
});
AppHead.displayName = 'AppHead';
