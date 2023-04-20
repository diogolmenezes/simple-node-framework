// load configuration file defined at NODE_ENV variable
const fs = require('fs');
const path = require('path');

const isTest = process.argv.some(argument => {
    return argument.includes('mocha') || argument.includes('jest');
});

const cwd = process.cwd();
const manifestPath = path.join(cwd, '.snf');
const manifest = fs.existsSync(manifestPath) && !isTest ? JSON.parse(fs.readFileSync(manifestPath)) : {};

const appDir = manifest.dir || '';
const configDir = path.join(cwd, appDir, 'api/config');

const env = process.env.NODE_ENV || 'default';
const isFramework = process.env.IS_FRAMEWORK;
const configFile = process.env.CONFIG_FILE;

let config;
if(configFile) {
    config = require(path.join(cwd, configFile));
} else {
    config = isFramework ? require(`${cwd}/config/env/${env}`) : require(`${configDir}/env/${env}`);
}

// inject app.env property
if (config.app) config.app.env = env;

function getCustomEnv(_config) {
    // DEPRECATED? Use extensões JS no lugar.
    const customEnvExists = fs.existsSync(`${configDir}/custom-env.js`);
    if (customEnvExists) {
        const customEnv = require(`${configDir}/custom-env`);
        return customEnv(_config);
    }

    return {};
}

const appConfig = { ...manifest, ...config, ...getCustomEnv(config) };

module.exports = appConfig;
