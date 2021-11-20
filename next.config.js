// @ts-check

const { resolve } = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

const SentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true,
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
};

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/c/0',
            },
            {
                source: '/auth/:path*',
                destination: '/api/auth/:path*',
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/category/:path*',
                destination: '/c/:path*',
                permanent: true,
            },
            {
                source: '/article/:path*',
                destination: '/a/:path*',
                permanent: true,
            },
        ];
    },
    sassOptions: {
        includePaths: [resolve(__dirname, './styles')],
    },
    eslint: {
        dirs: ['src'],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.test.(t|j)sx?$/,
            loader: 'ignore-loader',
        });
        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
        });
        return config;
    },
    publicRuntimeConfig: {
        appEnvironment: process.env.APP_ENVIRONMENT,
        sentryDsn: process.env.SENTRY_DSN,
        socketUrl: process.env.API_SOCKET_URL,
        cloudimageToken: process.env.CLOUDIMG_TOKEN,
    },
};

module.exports = withSentryConfig(nextConfig, SentryWebpackPluginOptions);
