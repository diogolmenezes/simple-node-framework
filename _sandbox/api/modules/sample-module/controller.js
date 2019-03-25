const { BaseController } = require('simple-node-framework').Base;

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
}

module.exports = Controller;
