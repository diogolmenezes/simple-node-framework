const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    
    constructor() {
        super({
            module: 'My Sample Controller'
        });        
    }

    get(req, res, next) {
        res.send(200, 'Sample controller test');
        return next();
    }
}

module.exports = Controller;