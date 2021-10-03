const path = require('path');

module.exports = {
    core: {
        builder: 'webpack5',
    },
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        {
            name: '@storybook/preset-scss',
            options: {
                sassLoaderOptions: {
                    sassOptions: {
                        includePaths: [path.resolve(process.cwd(), './styles')],
                    },
                },
            },
        },
        '@storybook/react',
        '@storybook/addon-links',
        '@storybook/addon-essentials',
    ],
    webpackFinal: async (config) => {
        config.resolve.modules.push(path.resolve(__dirname, '../src'));

        return config;
    },
};
