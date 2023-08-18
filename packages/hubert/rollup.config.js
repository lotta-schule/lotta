import { dirname } from 'node:path';
import esbuild from 'rollup-plugin-esbuild';
import preserveDirectivesPlugin from 'rollup-plugin-preserve-directives';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: dirname(pkg.module),
      // file: pkg.module,
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
    },
    external: (id) => !/^[./]/.test(id),
    plugins: [
      esbuild({
        include: /src\/.*\.[jt]sx?$/,
        exclude: ['test-utils.tsx', /\.stories\.[jt]sx?$/, /node_modules/],
      }),
      postcss({
        extract: 'index.css',
        plugins: [],
      }),
      preserveDirectivesPlugin({ supressPreserveModulesWarning: true }),
    ],
    onwarn(warning, warn) {
      if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
        warn(warning);
      }
    },
  },
  {
    input: './src/index.ts',
    output: [
      {
        // file: 'dist/index.d.ts',
        dir: 'dist',
        format: 'es',
        preserveModules: true,
      },
    ],
    external: (id) => /\.s?css$/.test(id),
    plugins: [dts()],
  },
];
