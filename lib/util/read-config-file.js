const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const process = require('process');

const { parsed: env } = require('dotenv').config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});

const YAML_CONFIG_FILE_NAME = 'config';

const readConfig = () => {
  const hasYamlConfigFile = hasYamlConfigs();

  if (hasYamlConfigFile) {
    return readYamlConfigs();
  }

  return legacyReadConfigFile();
};

const existFileSync = (fileName, extensions) => {
  const cwd = process.cwd();

  for (const ext of extensions) {
    const filePath = path.join(cwd, fileName + ext);
    if (fs.existsSync(filePath)) {
      return true;
    }
  }

  return false;
};

const readExistFileSync = (fileName, extensions) => {
  const cwd = process.cwd();

  for (const ext of extensions) {
    const filePath = path.join(cwd, fileName + ext);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return null;
};

const hasYamlConfigs = () => {
  const extensions = ['.yaml', '.yml'];
  return (
    existFileSync(YAML_CONFIG_FILE_NAME, extensions) ||
    (process.env.NODE_ENV &&
      existFileSync(
        `${YAML_CONFIG_FILE_NAME}.${process.env.NODE_ENV}`,
        extensions
      ))
  );
};

const readAndParseYamlConfigFile = (configFile) => {
  let data = readExistFileSync(configFile, ['.yaml', '.yml']);

  const envs = { ...env, ...process.env };

  const commentLine = /^#.*$/gm;
  data = data.replace(commentLine, '');

  for (const key in envs) {
    data = data.replaceAll('${' + key + '}', envs[key]);
  }

  const unresolvedVariables = data.match(/\$\{.*\}/gm);

  if (unresolvedVariables?.length > 0 && process.env.NODE_ENV !== 'testing') {
    const variables = unresolvedVariables.reduce((a, b) => a.concat(', ', b))
    throw new Error(`Config has unresolved variable(s): ${variables}`);
  }

  return yaml.load(data);
};

const readYamlConfigs = () => {
  const defaultConfig = readAndParseYamlConfigFile(YAML_CONFIG_FILE_NAME);
  const hasOverrideConfig =
    process.env.NODE_ENV &&
    existFileSync(`${YAML_CONFIG_FILE_NAME}.${process.env.NODE_ENV}`, [
      '.yaml',
      '.yml',
    ]);

  if (hasOverrideConfig) {
    const overrdingConfig = readAndParseYamlConfigFile(
      `${YAML_CONFIG_FILE_NAME}.${process.env.NODE_ENV}`
    );
    return {
      ...defaultConfig,
      ...overrdingConfig,
    };
  }

  return defaultConfig;
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
