const Base = require("./base");

// this class adds base to service classes
class BaseService extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseService;
