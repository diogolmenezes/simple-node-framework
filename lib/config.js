// load configuration file defined at NODE_ENV variable
const cwd = process.cwd();
const env = process.env.NODE_ENV || 'default';

const isFramework = process.env.IS_FRAMEWORK;
const config = isFramework ? require(`${cwd}/config/env/${env}`) : require(`${cwd}/api/config/env/${env}`);

// inject app.env property
if (config.app) config.app.env = env;

module.exports = config;
