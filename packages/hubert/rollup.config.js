import esbuild from 'rollup-plugin-esbuild';
import preserveDirectivesPlugin from 'rollup-plugin-preserve-directives';
import postcss from 'rollup-plugin-postcss';

export default [
    {
        input: 'src/index.ts',
        output: {
            dir: './dist',
            format: 'esm',
            sourcemap: true,
            preserveModules: true,
        },
        external: (id) => !/^[./]/.test(id),
        plugins: [
            esbuild({
                include: /src\/.*\.[jt]sx?$/,
                exclude: [
                    'test-utils.tsx',
                    /\.stories\.[jt]sx?$/,
                    /node_modules/,
                ],
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
];
