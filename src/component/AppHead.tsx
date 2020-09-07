import React, { memo } from 'react';
import { useSystem } from 'util/client/useSystem';
import { useTheme } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { textFonts, headerFonts } from './layouts/adminLayout/systemManagment/presentation/fonts';

export const AppHead = memo(() => {
    const system = useSystem();
    const theme = useTheme();

    const allFonts = [...textFonts, ...headerFonts];

    const title = system.title ?? '';
    return (
        <Helmet>
            <title>{title}</title>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
            <link rel="mask-icon" href={`${process.env.PUBLIC_URL}/favicon/safari-pinned-tab.svg`} color={theme.palette.primary.main} />
            <meta name="theme-color" content={theme.palette.primary.main} />
            <meta name="apple-mobile-web-app-title" content={title} />
            <meta name="application-name" content={title} />

            {[theme.typography.fontFamily, (theme.overrides as any).LottaArticlePreview.title.fontFamily].map((fontName, i) => {
                const foundFont = allFonts.find(font => font.name === fontName);
                if (foundFont) {
                    return (
                        <link key={i} rel={'stylesheet'} href={foundFont.url} />
                    );
                }
                return null;
            })}
        </Helmet>
    );
});
