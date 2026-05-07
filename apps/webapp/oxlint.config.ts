import { defineConfig } from 'oxlint';
import baseConfig from '../../oxlint.config.ts';

export default defineConfig({
  extends: [baseConfig],
  plugins: [...baseConfig.plugins, 'react', 'react-perf', 'jsx-a11y', 'nextjs'],
  jsPlugins: ['eslint-plugin-react-compiler'],
});
