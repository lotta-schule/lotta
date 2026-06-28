import { defineConfig } from 'oxlint';
import baseConfig from '../../oxlint.config.mts';

export default defineConfig({
  extends: [baseConfig],
  plugins: [...baseConfig.plugins, 'react', 'react-perf', 'jsx-a11y'],
});
