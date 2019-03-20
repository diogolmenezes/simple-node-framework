// carrega os arquivos de configuracao do proprio framework
// carrega o arquivo de configuração conforme a variavel NODE_ENV.
const cwd = process.cwd();
const env = process.env.NODE_ENV || 'default';
const config = require(`./env/${env}`);

// injeta automaticamente a propriedade app.env no json de configuração
config.env = env;

module.exports = config;
