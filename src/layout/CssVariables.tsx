import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { decomposeColor } from '@material-ui/core/styles';
import kebabCase from 'lodash/kebabCase';

export type CssVarValue = number[] | string;

const getCssValue = (value: CssVarValue): string => {
    if (
        value instanceof Array &&
        value.length === 3 &&
        typeof value[0] === 'number'
    ) {
        return value.join(', ');
    }
    return String(value);
};

export const CssVariables = React.memo(() => {
    const theme = useTheme();
    const cssVariables = React.useMemo<Record<string, CssVarValue>>(
        () => ({
            primaryColor: decomposeColor(
                theme.palette.secondary.main
            ).values.slice(0, 3),
            secondaryColor: decomposeColor(
                theme.palette.primary.main
            ).values.slice(0, 3),
            errorColor: decomposeColor(theme.palette.error.main).values.slice(
                0,
                3
            ),
            navigationColor: decomposeColor(
                theme.palette.primary.main
            ).values.slice(0, 3),
            disabledColor: decomposeColor(
                theme.palette.text.disabled
            ).values.slice(0, 3),
            textColor: decomposeColor(theme.palette.text.primary).values.slice(
                0,
                3
            ),
            labelTextColor: decomposeColor(
                theme.palette.text.hint
            ).values.slice(0, 3),
            contrastTextColor: decomposeColor(
                theme.palette.primary.contrastText
            ).values.slice(0, 3),
            boxBackgroundColor: decomposeColor(
                theme.palette.background.paper
            ).values.slice(0, 3),
            pageBackgroundColor: decomposeColor(
                theme.palette.background.default
            ).values.slice(0, 3),
            dividerColor: [200, 200, 200],
            highlightColor: [200, 200, 200],
            bannerBackgroundColor1: [54, 123, 240],
            bannerBackgroundColor2: [54, 123, 240],
            typographyTitleFontFamily: (theme.overrides as any)
                ?.LottaArticlePreview.title.fontFamily as string,
            typographyFontFamily: theme.typography.fontFamily as string,
            spacing: `${theme.spacing(1)}px`,
            borderRadius: `${theme.shape.borderRadius}px`,
        }),
        [theme]
    );

    return (
        <style>{`
            :root {
                ${Object.keys(cssVariables)
                    .map(
                        (jsName) =>
                            `--lotta-${kebabCase(jsName)}: ${getCssValue(
                                cssVariables[jsName]
                            )};`
                    )
                    .join('\n')}
            }
        `}</style>
    );
});
CssVariables.displayName = 'CssVariables';
