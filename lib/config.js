// carrega o arquivo de configuração conforme a variavel NODE_ENV.
var cwd = process.cwd();
const env = process.env.NODE_ENV || 'default';

// indica se é um framework para poder importar a configuração do caminho correto
const isFramework = process.env.IS_FRAMEWORK;

const config = (isFramework) ? require(`${cwd}/config/env/${env}`) : require(`${cwd}/api/config/env/${env}`);

// injeta automaticamente a propriedade app.env no json de configuração
if(config.app)
    config.app.env = env;

module.exports = config;
