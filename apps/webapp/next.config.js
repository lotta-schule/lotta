// @ts-check

import { resolve } from 'node:path';
import { env } from 'node:process';
import { URL } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = new URL('.', import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ['@lotta-schule/hubert'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/c/0',
        },
        {
          source: '/setup/:path*',
          destination: '/api/auth/:path*',
        },
        {
          source: '/auth/:path*',
          destination: '/api/auth/:path*',
        },
        {
          source: '/storage/:path*',
          destination: '/api/storage/:path*',
        },
        {
          source: '/data/:path*',
          destination: `${env.API_URL || ''}/data/:path*`,
        },
        {
          source: '/api',
          destination: '/api/backend',
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
      ],
      afterFiles: [],
      fallback: [],
    };
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
      resolve(__dirname, '../../libs/hubert/src/theme'),
    ],
    quietDeps: true,
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
      '@lotta-schule/hubert': resolve(
        __dirname,
        '../../libs/hubert/src/index.ts'
      ),
      '@lotta-schule/hubert/*': resolve(__dirname, '../../libs/hubert/src/*'),
    };

    return config;
  },
  publicRuntimeConfig: {
    appEnvironment: env.APP_ENVIRONMENT || env.NODE_ENV || 'development',
    imageName: env.IMAGE_NAME || 'test',
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tenantSlugOverwrite: env.FORCE_TENANT_SLUG,
  },
};

// sentry should be last, wrapping the rest
export default withSentryConfig(nextConfig, {
  silent: true,

  disableLogger: true,

  release: { name: env.NEXT_PUBLIC_RELEASE_NAME },
  org: 'lotta',
  project: 'web',
  widenClientFileUpload: true,

  tunnelRoute: '/stry',

  sourcemaps: {
    deleteSourcemapsAfterUpload: false,
  },

  reactComponentAnnotation: {
    enabled: true,
  },
});
