// @ts-check

import { resolve } from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  dryRun: !process.env.SENTRY_AUTH_TOKEN?.length,
};

const __dirname = new URL('.', import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpileModules: [
    '@lotta-schule/hubert',
    resolve(__dirname, '../hubert/src/index.ts'),
  ],
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
      // web manifest
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
      // Plausible Analytics
      {
        source: '/p/script.js',
        destination: 'https://plausible.intern.lotta.schule/js/script.js',
      },
      {
        source: '/p/e',
        destination: 'https://plausible.intern.lotta.schule/api/event',
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
    includePaths: [
      resolve(__dirname, './src/styles/util'),
      resolve(__dirname, '../hubert/src/theme'),
    ],
  },
  eslint: {
    dirs: ['src'],
  },
  generateEtags: false,
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

    config.resolve.alias = {
      ...config.resolve.alias,
      '@lotta-schule/hubert': resolve(__dirname, '../hubert/src/index.ts'),
      '@lotta-schule/hubert/*': resolve(__dirname, '../hubert/src/*'),
    };

    return config;
  },
  publicRuntimeConfig: {
    appEnvironment:
      process.env.APP_ENVIRONMENT || process.env.NODE_ENV || 'development',
    imageName: process.env.IMAGE_NAME || 'test',
    sentryDsn: process.env.SENTRY_DSN,
    socketUrl: process.env.API_SOCKET_URL,
    tenantSlugOverwrite: process.env.FORCE_TENANT_SLUG,
  },
};

export default withSentryConfig(nextConfig, SentryWebpackPluginOptions);
