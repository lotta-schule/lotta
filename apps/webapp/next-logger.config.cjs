// Configuration for next-logger (loaded from the working directory at runtime,
// see the Dockerfile). next-logger defaults pino to `debug`; production and
// staging should only log `info` and above unless LOG_LEVEL says otherwise.
module.exports = {
  logger: (defaultConfig) =>
    require('pino')({
      ...defaultConfig,
      level: process.env.LOG_LEVEL || 'info',
    }),
};
