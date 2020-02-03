const restifyErrors = require('restify-errors');
const Loggable = require('./base/loggable');

// this class handle with application errors, you can differentiate business errors from unexpected errors
class ErrorHandler extends Loggable {
    constructor() {
        super({
            module: 'SNF Error Handler'
        });
        this.restifyErrors = restifyErrors;
        this.defineCustomErrors();
    }

    // override this method to put your custom errors
    defineCustomErrors() {
        this.restifyErrors.InvalidTokenError = this.restifyErrors.makeConstructor('InvalidTokenError', {
            statusCode: 404,
            failureType: 'motion'
        });

        this.restifyErrors.BusinessError = this.restifyErrors.makeConstructor('BusinessError', {
            statusCode: 500,
            failureType: 'motion'
        });

        // this.restifyErrors.InvalidIdendifierError = this.restifyErrors.makeConstructor('InvalidIdendifierError', {
        //     statusCode: 400,
        //     failureType: 'motion'
        // });
        //
        // Ex.: ErrorHandler.throw('Your CPF is not valid', 'InvalidIdendifierError')
    }

    // throw restify compatible errors. if you throw in a string, it will throw an BusinessError
    throw(error, type) {
        const isError = error instanceof Error;
        const isResityError = error.body;

        if (isError) {
            if (!isResityError) {
                return new this.restifyErrors.InternalServerError({
                    cause: error
                }, error.message);
            }

            return error;
        }

        if (!type) {
            return new this.restifyErrors.BusinessError(error);
        }

        return new this.restifyErrors[type](error);
    }

    // automacaly logs all application throwed errors
    // override this method to put your custom error handle like:
    // callAdministrator(error)
    // updateStatistics(error)
    handle(req, res, error, callback) {
        this.log.error(error.message, {
            path: req.path(),
            stack: error.stack,
            error
        });

        // Override this method to put your custom error handle like:
        // callAdministrator(error);
        // updateStatistics(error);

        if (typeof (callback) === 'function') callback(req, res, error);
        else res.send(error.statusCode || 500);
    }

    // helper to sends an response and logs the error
    send(req, res, error, respondWith) {
        this.log.error(error.message, {
            path: req.path(),
            stack: error.stack,
            error
        });

        if (!(respondWith instanceof Error)) {
            respondWith = new Error(respondWith || ''); // eslint-disable-line 
        }

        res.send(respondWith.statusCode || 500, respondWith.message);
    }
}

module.exports = {
    class: ErrorHandler,
    instance: new ErrorHandler()
};
