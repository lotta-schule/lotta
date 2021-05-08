import * as React from 'react';
import { deDE } from '@material-ui/core/locale';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { setThemeDecorator } from './addons/css-vars-theme/setThemeDecorator';
import '../src/index.scss';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
};

const primary = [38, 83, 191];
const text = [3, 3, 3];
const box_background = [255, 255, 255];

const toRgb = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

const muiTheme = createMuiTheme(
    {
        palette: {
            primary: { main: toRgb(primary) },
            text: { primary: toRgb(text) },
            box_background: { main: toRgb(box_background) },
        },
    },
    deDE
);
export const decorators = [
    setThemeDecorator,
    (Story) => (
        <ThemeProvider theme={muiTheme}>
            <Story />
        </ThemeProvider>
    ),
];
