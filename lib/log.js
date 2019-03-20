const os = require('os');
const config = require('./config');
const prettyFormat = require('pretty-format');
const bunyan = require('bunyan');
const fs = require('fs');
const truncate = require('truncate');

// Classe responsável por gerenciar e prover logs para a aplicação
class Log {
    constructor() {
        this.config = config;

        if (this.config.log) {
            // TODO: refatorar a maneira com que defino o hostname
            this.config.log.bunyan.streams[0].path = this.config.log.bunyan.streams[0].path.replace('{hostname}', os.hostname());

            this.setHostName(this.config.log.bunyan);

            this.bunyanLogger = bunyan.createLogger(this.config.log.bunyan);

            this.prefix = this.buildPrefix('');
        }
    }

    // Pega o host name de /etc/hostname
    // Para poder pegar da maquina que é host dos containers, você precisa compartilhar
    // o arquivo no volume do docker.
    // volumes:
    //   - /etc/hostname:/etc/hostname:ro
    setHostName(config) {
        let hostname = 'hostname' || fs.readFileSync('/etc/hostname');

        hostname = hostname ? hostname.toString().trim() : undefined;

        let hasHostnameOfHost = hostname && hostname !== process.env.HOSTNAME;

        if (hasHostnameOfHost) {
            config.host = hostname;
        }
    }

    // Exibe o log de maneira formatada no console
    // Ex.: Modulo => Carregando alguma coisa { cpf: '12345678912' }
    console(type, msg, obj) {
        if (type !== 'trace') {
            console.log(`${type.toUpperCase()} ${this.prefix} ${msg} ${obj ? this.pretty(obj, {
                min: true
            }) : ''}`);
        }
    }

    removeCircular(object) {
        for (let k in object) {
            if (typeof (object[k]) === 'object') {
                if (object[k] && object[k].constructor && object[k].constructor.name === 'Array') {
                    object[k] = this.removeCircular(object[k]);
                } else delete object[k];
            }
        }

        return object;
    }

    info(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'info',
        });
    }

    warn(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'warn',
        });
    }

    debug(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'debug',
        });
    }

    trace(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'trace',
        });
    }

    error(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'error',
        });
    }

    fatal(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'fatal',
        });
    }

    child(props, serializers) {
        return this.bunyanLogger.child(props, serializers);
    }

    // Metodo responsavel por enviar o log para o bunyan.
    // Por padrao, todos os objetos enviados são logados como string
    // caso você precise que algum objeto seja logado como json para que seja mapeado
    // como um campo separado no elasticsearch,
    // envie a propriedade "natural":
    //   logger.debug('Mensagem', { natural: { tempoDeResposta: 1300 } });
    //
    // Caso seja necessário logar um objeto como json e um outro objeto
    // como string na mesma chamada, envie as propriedades "natural" e "pretty"
    //   logger.debug('Mensagem', { natural: { tempoDeResposta: 1300 }, pretty: response });
    write({ module, type, msg, obj }) {
        // clonando o parâmetro para grantir que as alterações não
        // serão refletidas fora desse método
        let objectToLog = Object.assign({}, obj);

        this.prefix = this.buildPrefix(module);

        if (!this.config.log) {
            this.console(type, `[Log is not defined at configuration file] ${msg}`);
            return;
        }

        if (this.config.log.debug) {
            this.console(type, msg);
        }

        if (obj) {
            if (obj.natural) {
                if (obj.pretty) {
                    objectToLog = {
                        natural: obj.natural,
                        pretty: this.pretty(obj.pretty)
                    };
                } else {
                    objectToLog = {
                        natural: obj.natural
                    };
                }
            } else {
                objectToLog = {
                    pretty: this.pretty({ obj })
                };

                // Se o arquivo for muito grande, truncate
                if (this.config.log.truncate) objectToLog.pretty = truncate(objectToLog.pretty, this.config.log.truncate);

            }

            this.bunyanLogger[type](objectToLog, `${this.prefix} ${msg}`);
        } else {
            // Se o arquivo for muito grande, truncate
            if (this.config.log.truncate) msg = truncate(msg, this.config.log.truncate);

            this.bunyanLogger[type](`${this.prefix} ${msg}`);
        }
    }

    // chama o pretty format mas define um maxDepth
    // para objetos request e response
    pretty(obj, options = {}) {
        options.maxDepth = options.maxDepth || 3;
        options.min = true;
        return prettyFormat(obj, options);
    }

    // cria um prefixo para o log
    buildPrefix(module) {
        const moduleName = module ? `${module}` : '';
        return `${moduleName} => `;
    }
}

// O Bunyan só pode ter uma instancia por arquivo
// https://github.com/trentm/node-bunyan/issues/235
module.exports = new Log();