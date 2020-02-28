const { BaseService } = require('simple-node-framework').Base;
const customErrors = require('../../../config/custom-errors');

class Service extends BaseService {
    constructor() {
        super({
            module: 'My Sample Service'
        });
    }

    testeErro() {
        throw customErrors.throw('This is a sample AndersonError on service', 'AndersonError');
    }
}

module.exports = Service;
