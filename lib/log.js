const os = require('os');
const fs = require('fs');
const bunyan = require('bunyan');
const truncate = require('truncate');
const prettyFormat = require('pretty-format');
const config = require('./config');

// this class abstract the log concept
/* eslint-disable no-param-reassign */
class Log {
    constructor() {
        this.config = config;

        if (this.config.log) {
            this.setStdOut();
            this.setHostName();
            this.bunyanLogger = bunyan.createLogger(this.config.log.bunyan);
            this.prefix = this.buildPrefix('');
        }
    }

    setStdOut() {
        const stream = this.config.log.bunyan.streams[0].stream;
        if (stream === 'process.stdout')
            this.config.log.bunyan.streams[0].stream = process.stdout;
    }

    // get machine hostname /etc/hostname
    // if you are using docker, you will need to share the host file (/etc/hostname) with the container:
    // volumes:
    //   - /etc/hostname:/etc/hostname:ro
    setHostName() {
        const hostname = fs.existsSync('/etc/hostname') ? fs.readFileSync('/etc/hostname').toString().trim() : undefined;

        const hasHostnameOfHost = hostname && hostname !== process.env.HOSTNAME;

        if (hasHostnameOfHost) {
            this.config.log.bunyan.host = hostname;
        }

        const stream = this.config.log.bunyan.streams[0];

        if (stream && stream.path)
            stream.path = stream.path.replace('{hostname}', os.hostname());
    }

    // show formated log in console
    // Ex.: ModuleName => Loading something { number: '12345678912' }
    console(type, msg, obj) {
        if (type !== 'trace') {
            console.log(
                `${type.toUpperCase()} ${this.prefix} ${msg} ${obj ? this.pretty(obj, { min: true }) : ''}`
            );
        }
    }

    // remove circular references from object
    /* eslint-disable no-restricted-syntax */

    removeCircular(object) {
        for (const k in object) {
            if (typeof object[k] === 'object') {
                if (object[k] && object[k].constructor && object[k].constructor.name === 'Array') {
                    object[k] = this.removeCircular(object[k]);
                } else delete object[k];
            }
        }
        return object;
    }
    /* eslint-enable no-restricted-syntax */

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
            type: 'info'
        });
    }

    // write warning logs
    warn(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'warn'
        });
    }

    // write debug logs
    debug(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'debug'
        });
    }

    // write trace logs
    trace(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'trace'
        });
    }

    // write error logs
    error(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'error'
        });
    }

    // write fatal logs
    fatal(module, msg, obj) {
        this.write({
            module,
            msg,
            obj,
            type: 'fatal'
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
    write({ module, type, msg, obj }) {
        // clonning the parameter to ensure that changes will be not made outside this method
        const _obj = Object.assign({}, obj);
        const objectToLog = {};

        this.prefix = this.buildPrefix(module);

        if (!this.config.log) {
            this.console(type, `[Log is not defined at configuration file] ${msg}`);
            return;
        }

        if (this.config.log.debug) {
            this.console(type, msg);
        }

        if (_obj) {
            // if natural, save without pretty
            if (_obj.natural) {
                objectToLog.natural = Object.assign({}, _obj.natural);
                delete _obj.natural;
            }

            objectToLog.pretty = this.pretty(_obj);

            // truncate if the value is big
            if (this.config.log.truncate) objectToLog.pretty = truncate(objectToLog.pretty, this.config.log.truncate);

            this.bunyanLogger[type](objectToLog, `${this.prefix} ${msg}`);
        } else {
            // truncate if the value is big
            if (this.config.log.truncate) msg = truncate(msg, this.config.log.truncate);
            this.bunyanLogger[type](`${this.prefix} ${msg}`);
        }
    }

    // call pretty-format with maxDepth
    pretty(obj, options = {}) {
        const _option = options;
        _option.maxDepth = options.maxDepth || 3;
        _option.min = true;
        return prettyFormat(obj, _option);
    }

    // build prefix for the log
    buildPrefix(module) {
        const moduleName = module ? `${module}` : '';
        return `${moduleName} => `;
    }
}

/* eslint-enable no-param-reassign */
// bunyan have to has only one instance per file: https://github.com/trentm/node-bunyan/issues/235
module.exports = {
    class: Log,
    instance: new Log()
};
