import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  cacheDir: '.vite',

  plugins: [react()],

  resolve: {
    tsconfigPaths: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: 'inline',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
