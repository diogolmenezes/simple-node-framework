const Base = require('./base');

// this class adds base functionalities to controllers
class BaseController extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseController;
