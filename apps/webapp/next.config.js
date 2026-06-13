// @ts-check

import { resolve } from 'node:path';
import { URL } from 'node:url';

const __dirname = new URL('.', import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'standalone',
  // Build-time type-checking is disabled because the build uses
  // `moduleResolution: nodenext` (required by Turbopack for the source-consumed
  // `hubert`/`theme` libs), and Next 16's own `.d.ts` files use extensionless
  // relative imports that nodenext can't resolve — breaking the types of Next's
  // default exports (e.g. `next/link`). Real type-checking runs separately under
  // `moduleResolution: bundler` via `bun run typecheck`. See TYPECHECK_MIGRATION_PLAN.md.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    externalDir: true,
    authInterrupts: true,
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
      '*.gql': {
        loaders: ['graphql-tag/loader'],
        as: '*.cjs',
      },
    },
    resolveAlias: {
      '@lotta-schule/hubert': '../../libs/hubert/src/index.ts',
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
};

export default nextConfig;
