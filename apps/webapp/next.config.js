// @ts-check

import { resolve } from 'node:path';
import { URL } from 'node:url';

const __dirname = new URL('.', import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ['@lotta-schule/hubert'],
  allowedDevOrigins: ['localhost', '*.lotta.lvh.me', '*.local.lotta.schule'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/c/:path*',
          destination: '/category/:path*',
        },
        {
          source: '/auth/:path*',
          destination: `/api/auth/:path*`,
        },
        {
          source: '/storage/:path*',
          destination: `/api/storage/:path*`,
        },
        {
          source: '/data/:path*',
          destination: `/api/data/:path*`,
        },
        {
          source: '/api',
          destination: `http://localhost:4000/api`,
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
  turbopack: {
    rules: {
      '*.graphql': {
        loaders: ['graphql-tag/loader'],
        as: '*.cjs',
      },
    },
    resolveExtensions: [
      '.graphql',
      '.gql',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.css',
      '.scss',
    ],
  },
  sassOptions: {
    loadPaths: [
      resolve(__dirname, './src/styles/util'),
      resolve(__dirname, '../../libs/hubert/src/theme'),
    ],
    quietDeps: true,
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
};

export default nextConfig;
