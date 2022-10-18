const { ErrorHandler } = require('simple-node-framework');

class CustomErrors extends ErrorHandler {
    constructor() {
        super({
            module: 'Custom Errors'
        });
    }

    defineCustomErrors() {
        super.defineCustomErrors();
        this.restifyErrors.SampleError = this.restifyErrors.makeConstructor('SampleError', {
            statusCode: 512,
            failureType: 'motion'
        });
    }
}

module.exports = new CustomErrors();
