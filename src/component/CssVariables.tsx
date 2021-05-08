import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { decomposeColor } from '@material-ui/core/styles';
import kebabCase from 'lodash/kebabCase';

export type CssVarValue = number[];

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
            errorColor: decomposeColor(theme.palette.error.main).values.slice(
                0,
                3
            ),
            disabledColor: decomposeColor(
                theme.palette.text.disabled
            ).values.slice(0, 3),
            textColor: decomposeColor(theme.palette.text.primary).values.slice(
                0,
                3
            ),
            contrastTextColor: decomposeColor(
                theme.palette.secondary.contrastText
            ).values.slice(0, 3),
            boxBackgroundColor: decomposeColor(
                theme.palette.background.paper
            ).values.slice(0, 3),
            pageBackgroundColor: decomposeColor(
                theme.palette.background.default
            ).values.slice(0, 3),
            bannerBackgroundColor1: [54, 123, 240],
            bannerBackgroundColor2: [54, 123, 240],
        }),
        [theme]
    );

    React.useEffect(() => {
        const root = document?.querySelector<HTMLElement>(':root');
        if (root) {
            Object.keys(cssVariables).forEach((jsName) => {
                const varName = `--lotta-${kebabCase(jsName)}`;
                if (process.env.NODE_ENV === 'development') {
                }
                root.style.setProperty(
                    varName,
                    getCssValue(cssVariables[jsName])
                );
            });
        }
    }, [cssVariables]);

    return null;
});
