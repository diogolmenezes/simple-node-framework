const Base = require('./base');

class BaseController extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseController;
