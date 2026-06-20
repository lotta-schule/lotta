import * as path from 'path';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '.vite',

  plugins: [
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
    tsconfigPaths: true,
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'hubert',
      fileName: (_format, entryName) => `${entryName}.js`,
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
    name: 'hubert component tests',

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
      enabled: true,
      clean: true,
      reportsDirectory: 'coverage',
      provider: 'v8',
      reporter: ['json', 'html'],
      exclude: ['test-utils.tsx', 'test.setup.ts', 'test-fixtures.ts', '.vite'],
      thresholds: {
        global: {
          statements: 90,
          branches: 70,
          functions: 90,
          lines: 90,
        },
      },
    },

    env: {
      TZ: 'Europe/Berlin',
      LOCALE: 'de_DE.UTF-8',
      LANGUAGE: 'de_DE:de',
    },
  },
});
