const { BaseController } = require('simple-node-framework').Base;
const customErrors = require('../../config/custom-errors');

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        super.activateRequestLog(req);
        this.log.debug('This is a sample log');
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
            throw customErrors.throw('This is a sample error', 'SampleError');
        } catch (error) {
            this.log.error('Unexpected error on load', error);
            return next(error);
        }
    }
}

module.exports = Controller;
