const { BaseController } = require('simple-node-framework').Base;
const { authorization } = require('simple-node-framework');

class Controller extends BaseController {    
    constructor() {
        super({
            module: 'My Sample Controller'
        });        
    }

    get(req, res, next) {
        const jwt = authorization.createJWT('nothing',  false);
        this.log.debug('This is a sample log');
        res.send(200, 'Sample controller test');
        req.cache.saveResponse(200, 'Sample controller test', res.headers, req)
        return next();
    }
}

module.exports = Controller;