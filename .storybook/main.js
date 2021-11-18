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
                cssLoaderOptions: { modules: true },
                sassLoaderOptions: {
                    includePaths: [path.resolve(process.cwd(), 'styles')],
                    sassOptions: {
                        modules: true,
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

        config.module.rules.push({
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'sass-loader',
                    options: {
                        sassOptions: {
                            includePaths: [
                                path.resolve(process.cwd(), 'styles'),
                            ],
                        },
                    },
                },
            ],
            include: path.resolve(__dirname, '../'),
        });

        config.resolve.alias = {
            ...config.resolve.alias,
            '~': path.resolve(process.cwd(), 'node_modules'),
        };

        return config;
    },
};
