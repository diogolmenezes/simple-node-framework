const { BaseController } = require('simple-node-framework').Base;
const customErrors = require('../../config/custom-errors');
const Service = require('./service/service');

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
        this.service = new Service();
    }

    get(req, res, next) {
        super.activateRequestLog(req);
        this.log.debug('This is a sample log');
        try {
            this.auditor.audit('SOME_USER', 'AppServer', 'Shutdown', 'Production-3 Instance', 'ec2-255-255-255-255', 'Terminated from web console.');
        } catch (error) {
            this.log.debug('Vamos');
        }
        res.send(200, 'Sample controller test');
        req.cache.saveResponse(200, 'Sample controller test', res.headers, req);
        return next();
    }

    // session sample
    session(req, res, next) {
        super.activateRequestLog(req);
        req.session.data.name = 'Diogo';
        req.session.update();
        console.log('SESSION DATA =>', req.session.data);
        res.send(200, 'Sample session controller test');
        return next();
    }

    // custom-error sample
    customError(req, res, next) {
        try {
            this.service.testeErro();
        } catch (error) {
            if (error.code !== 'AndersonError') {
                this.log.error('Unexpected error on load', error);
            }
            return next(error);
        }
    }
}

module.exports = Controller;
