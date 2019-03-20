const Base = require('./base');

class BaseService extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseService;
