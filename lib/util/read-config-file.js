const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const process = require('process');

const { parsed: env } = require('dotenv').config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});

const readConfig = () => {
  const cwd = process.cwd();

  const hasYamlConfigFile =
    fs.existsSync(path.join(cwd, 'snfrc.yml')) ||
    fs.existsSync(path.join(cwd, 'snfrc.yaml'));

  if (hasYamlConfigFile) {
    return readYamlConfigFile();
  }

  return legacyReadConfigFile();
};

const readYamlConfigFile = () => {
  const cwd = process.cwd();
  const pathYml = path.join(cwd, 'snfrc.yml');
  const pathYaml = path.join(cwd, 'snfrc.yaml');

  let data =
    (fs.existsSync(pathYml) && fs.readFileSync(pathYml, 'utf8')) ||
    (fs.existsSync(pathYaml) && fs.readFileSync(pathYaml, 'utf8'));

  for (const key in env) {
    data = data.replaceAll('${' + key + '}', env[key]);
  }

  const hasUnresolvedVariable = /\$\{.*\}/gm;

  if (hasUnresolvedVariable.test(data)) {
    throw new Error(`Config has unresolved variable`);
  }

  return yaml.load(data);
};

const legacyReadConfigFile = () => {
  const isTest = process.argv.some((argument) => {
    return argument.includes('mocha') || argument.includes('jest');
  });

  const cwd = process.cwd();
  const manifestPath = path.join(cwd, '.snf');
  const manifest =
    fs.existsSync(manifestPath) && !isTest
      ? JSON.parse(fs.readFileSync(manifestPath))
      : {};

  const appDir = manifest.dir || '';
  const configDir = path.join(cwd, appDir, 'api/config');

  const env = process.env.NODE_ENV || 'default';
  const isFramework = process.env.IS_FRAMEWORK;

  const config = isFramework
    ? require(`${cwd}/config/env/${env}`)
    : require(`${configDir}/env/${env}`);

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

  return { ...manifest, ...config, ...getCustomEnv(config) };
};

module.exports = readConfig;
