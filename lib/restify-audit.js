const bunyan = require('bunyan');
const config = require('./config');
const restify = require('restify');

class Audit {
    constructor() {
        this.config = config;
    }

    configure(server, customMethod) {
        if(this.config.audit) {
            this.logger = bunyan.createLogger(this.config.audit.bunyan);
            server.on('after', restify.plugins.auditLogger({
                server,
                event: 'after',
                log: this.logger,
                context: customMethod,
                printLog: this.config.audit.printLog
            }));
        }
    }
}

module.exports = new Audit();
