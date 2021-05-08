import * as React from 'react';
import { makeDecorator } from '@storybook/addons';
import { useAddonState } from '@storybook/client-api';

const localStorageState = localStorage.getItem('lotta-theme');

export const initialState = {
    'primary-color': [50, 100, 0],
    'error-color': [230, 0, 0],
    'text-color': [3, 3, 3],
    'disabled-color': [158, 158, 158],
    'contrast-text-color': [255, 255, 255],
    'box-background-color': [255, 255, 255],
    'page-background-color': [227, 227, 227],
    'banner-background-color1': [54, 123, 240],
    'banner-background-color2': [240, 240, 240],
    ...(localStorageState && JSON.parse(localStorageState)),
};

export const setThemeDecorator = makeDecorator({
    name: 'Lotta-Storybook-CSS-Theming-Addon',
    parameterName: 'theme',
    skipIfNoParametersOrOptions: false,
    wrapper: (getStory, context, args) => {
        // eslint-disable-next-line
        const [state, setState] = useAddonState(
            'Lotta-Storybook-CSS-Variables-Theming-Addon',
            initialState
        );
        window.addEventListener(
            'message',
            ({ data }) => {
                if (typeof data === 'string') {
                    const match = data.match(
                        /^Lotta-Storybook-CSS-Theming-Addon:(?<json>.*)/
                    );
                    if (match) {
                        setState(JSON.parse(match.groups.json));
                    }
                }
            },
            false
        );

        return React.createElement(React.Fragment, {}, [
            React.createElement(
                'style',
                {},
                ':root {' +
                    Object.keys(state)
                        .map(
                            (key) => `--lotta-${key}: ${state[key].join(', ')};`
                        )
                        .join('\n') +
                    '}'
            ),
            getStory(context),
        ]);
    },
});
