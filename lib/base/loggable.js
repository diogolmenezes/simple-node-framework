const logger = require("../log");
const Scope = require("../scope");
const Helpers = require("../util/helpers");

// this class provides log and scope features to classes
class Loggable extends Scope {
    constructor({ module }) {
        super({ module });
        this.logger = logger;
        this.module = module;
        this.configureLog();
    }

    // put the request id in the scope.
    // this method have to be MANUALY called on the first line of the application controller
    // super.activateRequestLog(req);
    activateRequestLog(req) {
        const requestId = Helpers.requestId(req);
        this.addScope({ request_id: requestId });
    }

    // put in the log all the scope variables
    addRequestToLog(obj) {
        if (this.scope && this.scope.request_id) {
            if (typeof obj === "object")
                obj = Object.assign(
                    {},
                    { ...obj, request_id: this.scope.request_id }
                );
            else
                obj = Object.assign(
                    {},
                    { obj, request_id: this.scope.request_id }
                );
        }

        return obj;
    }

    // create the overloads to automacaly repass the module name and the scope to the log
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
