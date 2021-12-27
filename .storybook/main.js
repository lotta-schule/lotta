const path = require('path');

module.exports = {
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
    framework: '@storybook/react',
    core: {
        builder: 'webpack5',
    },
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

        config.resolve.fallback = {
            ...config.resolve.fallback,
            path: false,
        };

        config.resolve.alias = {
            ...config.resolve.alias,
            '~': path.resolve(process.cwd(), 'node_modules'),
        };

        return config;
    },
};
