const baseConfig = require('../../jest.base-config.cjs');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 * @see https://jestjs.io/docs/configuration
 **/
const jestConfig = {
  ...baseConfig,
};

module.exports = jestConfig;
