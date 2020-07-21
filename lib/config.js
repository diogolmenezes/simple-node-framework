// load configuration file defined at NODE_ENV variable
const fs = require('fs');

const cwd = process.cwd();
const env = process.env.NODE_ENV || 'default';

const isFramework = process.env.IS_FRAMEWORK;
const config = isFramework ? require(`${cwd}/config/env/${env}`) : require(`${cwd}/api/config/env/${env}`);

// inject app.env property
if (config.app) config.app.env = env;

function getCustomEnv(_config) {
    const customEnvExists = fs.existsSync(`${cwd}/api/config/custom-env.js`);
    if (customEnvExists) {
        const customEnv = require(`${cwd}/api/config/custom-env`);
        return customEnv(_config);
    }

    return {};
}

const appConfig = { ...config, ...getCustomEnv(config) };

module.exports = appConfig;
