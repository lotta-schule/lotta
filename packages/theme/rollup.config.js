import esbuild from 'rollup-plugin-esbuild';

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
                include: /src\/.*\.ts$/,
                exclude: [/node_modules/],
            }),
        ],
    },
];
