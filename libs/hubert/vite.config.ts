import * as path from 'path';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir: '.vite',

  plugins: [
    tsconfigPaths(),
    react(),
    externalizeDeps({
      devDeps: true,
      peerDeps: true,
      optionalDeps: true,
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.json'),
      exclude: ['../theme/**/*'],
    }),
  ],

  resolve: {
    alias: {
      '@lotta-schule/theme': path.resolve(__dirname, '../theme'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'hubert',
      fileName: (_format, entryName) => `${entryName}.js`,
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  test: {
    globals: true,
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: 'chromium', headless: !!process.env.CI }],
      viewport: { width: 1280, height: 720 },
    },

    setupFiles: ['./test.setup.ts'],
    retry: process.env.GITHUB_ACTIONS ? 2 : 0,
    include: ['src/**/*.test.{ts,tsx}'],

    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'github-actions']
      : ['default'],
    outputFile: 'coverage/junit.xml',
    coverage: {
      enabled: !!process.env.CI,
      clean: true,
      reportsDirectory: 'coverage',
      provider: 'istanbul',
      reporter: ['json'],
      exclude: ['test-utils.tsx', 'test.setup.ts', 'test-fixtures.ts'],
    },
  },
});
