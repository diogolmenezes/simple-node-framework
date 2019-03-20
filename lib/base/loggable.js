const logger = require('../log');
const Scope = require('../scope');
const Helpers = require('../util/helpers');

class Loggable extends Scope {

    constructor({ module }) {
        super({ module });
        this.logger = logger;
        this.module = module;
        this.configureLog();
    }

    // Coloca o request ID no escopo, deve ser chamado manualmente pela 
    // aplicacao, de preferencia na primeira linha do controller
    // super.activateRequestLog(req);
    activateRequestLog(req) {
        const requestId = Helpers.requestId(req);
        this.addScope({ request_id: requestId });
    }

    // Grava no log as variaveis que estão embutidas no escopo
    addRequestToLog(obj) {
        if (this.scope && this.scope.request_id) {
            if (typeof (obj) === 'object')
                obj = Object.assign({}, { ...obj, request_id: this.scope.request_id });
            else
                obj = Object.assign({}, { obj, request_id: this.scope.request_id });
        }

        return obj;
    }

    // Cria as sobrecargas para repassar automaticamente o nome do modulo e o escopo para o log
    configureLog() {
        this.log = {};

        this.log.info = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.info(this.module, msg, obj);
        };

        this.log.warn = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.info(this.module, msg, obj);
        };

        this.log.debug = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.debug(this.module, msg, obj);
        };

        this.log.trace = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.trace(this.module, msg, obj);
        };

        this.log.error = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.error(this.module, msg, obj);
        };

        this.log.fatal = (msg, obj) => {
            obj = this.addRequestToLog(obj);
            this.logger.fatal(this.module, msg, obj);
        };
    }
}

module.exports = Loggable;
