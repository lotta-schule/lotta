import * as path from 'path';
import { defineConfig } from 'vite';
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
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'github-actions']
      : ['default'],
    outputFile: 'coverage/junit.xml',
    setupFiles: ['./test.setup.ts'],
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
