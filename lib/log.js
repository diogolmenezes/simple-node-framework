const os = require('os');
const config = require('./config');
const prettyFormat = require('pretty-format');
const bunyan = require('bunyan');
const fs = require('fs');
const truncate = require('truncate');

// this class abstract the log concept
class Log {
    constructor() {
        this.config = config;

        if (this.config.log) {
            // TODO: we need refactory hostname definition
            this.config.log.bunyan.streams[0].path = this.config.log.bunyan.streams[0].path.replace('{hostname}', os.hostname());

            this.setHostName(this.config.log.bunyan);

            this.bunyanLogger = bunyan.createLogger(this.config.log.bunyan);

            this.prefix = this.buildPrefix('');
        }
    }

    // get machine hostname /etc/hostname
    // if you are using docker, you will need to share the host file (/etc/hostname) with the container:
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

    // show formated log in console
    // Ex.: ModuleName => Loading something { number: '12345678912' }
    console(type, msg, obj) {
        if (type !== 'trace') {
            console.log(`${type.toUpperCase()} ${this.prefix} ${msg} ${obj ? this.pretty(obj, {
                min: true
            }) : ''}`);
        }
    }

    // remove circular references from object
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

    // define bunyan child logs
    child(props, serializers) {
        return this.bunyanLogger.child(props, serializers);
    }

    // write information logs
    info(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'info',
        });
    }

    // write warning logs
    warn(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'warn',
        });
    }

    // write debug logs
    debug(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'debug',
        });
    }

    // write trace logs
    trace(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'trace',
        });
    }

    // write error logs
    error(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'error',
        });
    }

    // write fatal logs
    fatal(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'fatal',
        });
    }


    // this method sends the log to bunyan.
    // by default all the objects are logged as strings, if you need that some object 
    // be logged with the real format (json), just send the value inside the "natural"
    // property:
    //   logger.debug('My message', { natural: { responseTime: 1300, month: 12 } });
    //
    // if you need log one object as natural mode and another as string on the same call, 
    // just send "natural" and "pretty" properties:
    //   logger.debug('Mensagem', { natural: { tempoDeResposta: 1300 }, pretty: response });
    write({
        module,
        type,
        msg,
        obj
    }) {
        // clonning the parameter to ensure that changes will be not made outside this method
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
                    pretty: this.pretty({
                        obj
                    })
                };

                // truncate if the value is big
                if (this.config.log.truncate) objectToLog.pretty = truncate(objectToLog.pretty, this.config.log.truncate);
            }

            this.bunyanLogger[type](objectToLog, `${this.prefix} ${msg}`);
        } else {
            // truncate if the value is big
            if (this.config.log.truncate) msg = truncate(msg, this.config.log.truncate);
            this.bunyanLogger[type](`${this.prefix} ${msg}`);
        }
    }

    // call pretty-format with maxDepth
    pretty(obj, options = {}) {
        options.maxDepth = options.maxDepth || 3;
        options.min = true;
        return prettyFormat(obj, options);
    }

    // build prefix for the log
    buildPrefix(module) {
        const moduleName = module ? `${module}` : '';
        return `${moduleName} => `;
    }
}

// bunyan have to has only one instance per file: https://github.com/trentm/node-bunyan/issues/235
module.exports = new Log();