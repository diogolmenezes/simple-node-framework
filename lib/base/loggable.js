const Scope = require('../scope');
const Helpers = require('../util/helpers');
const logger = require('../log').instance;

// this class provides log and scope features to classes
class Loggable extends Scope {
    constructor({ module }) {
        super({ module });
        this.logger = logger;
        this.module = module;
        this.configureLog();
    }

    // put the request id and user in the scope.
    // this method have to be MANUALY called on the first line of the application controller
    // super.activateRequestLog(req);
    activateRequestLog(req) {
        const requestId = Helpers.requestId(req);
        this.logger.bunyanLogger.fields.request_id = requestId; // TODO: depois que testar remover essa experiencia
        this.addScope({ request_id: requestId, user: req.user });
    }

    // put in the log all the scope variables
    addRequestToLog(obj = {}) {
        if (!obj) return undefined;

        // clone if its an object
        const _obj = (typeof obj === 'object') ? Object.assign({}, obj) : { obj };

        if (this.scope && this.scope.request_id) {

            // include natural field to add request_id
            _obj.natural = _obj.natural || {};
            _obj.natural.request_id = this.scope.request_id;

            // // resolvendo o Bug que fazia o stack nao ser logado
            if (obj instanceof Error) {
                _obj.stacktrace = obj.stack || obj.stacktrace;
                _obj.message = obj.message;
            }
        }

        return _obj;
    }

    // create the overloads to automacaly repass the module name and the scope to the log
    configureLog() {
        this.log = {};

        this.log.info = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.info(this.module, msg, _obj);
        };

        this.log.warn = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.info(this.module, msg, _obj);
        };

        this.log.debug = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.debug(this.module, msg, _obj);
        };

        this.log.trace = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.trace(this.module, msg, _obj);
        };

        this.log.error = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.error(this.module, msg, _obj);
        };

        this.log.fatal = (msg, obj) => {
            const _obj = this.addRequestToLog(obj);
            this.logger.fatal(this.module, msg, _obj);
        };
    }
}

module.exports = Loggable;
