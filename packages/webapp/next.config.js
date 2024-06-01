// @ts-check

import { resolve } from 'node:path';
import { env, version } from 'node:process';
import { URL } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = new URL('.', import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    externalDir: true,
    instrumentationHook: true,
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
    appEnvironment: env.APP_ENVIRONMENT || env.NODE_ENV || 'development',
    imageName: env.IMAGE_NAME || 'test',
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
    socketUrl: env.API_SOCKET_URL,
    tenantSlugOverwrite: env.FORCE_TENANT_SLUG,
  },
};

console.log('Sentry DSN:', env.NEXT_PUBLIC_SENTRY_DSN);
console.log('Sentry AUth Token:', env.SENTRY_AUTH_TOKEN);

// sentry should be last, wrapping the rest
export default withSentryConfig(nextConfig, {
  silent: false,

  disableLogger: true,

  org: 'lotta',
  project: 'web',
  widenClientFileUpload: true,

  authToken: env.SENTRY_AUTH_TOKEN,
});
