const config = require('../config');
const applicationErrors = require('../errors');
const Helpers = require('../util/helpers');

class Origin {
    constructor() {
        this.config = config;
        this.applicationErrors = applicationErrors;
    }

    proccess(req, res, next) {
        if (this.config.origin && this.itsNotToIgnore(req)) {

            const requestId = Helpers.requestId(req);

            if (!this.hasApplication(req)) {
                return next(this.applicationErrors.throw(`O header x-origin-application é obrigatório  para o request [${requestId}].`, 'PreconditionFailedError')); // 412
            }

            if (!this.hasChannel(req)) {
                return next(this.applicationErrors.throw(`O header x-origin-channel é obrigatório para o request [${requestId}].`, 'PreconditionFailedError')); // 412
            }

            if (!this.hasDevice(req)) {
                return next(this.applicationErrors.throw(`O header x-origin-device é obrigatório para o request [${requestId}].`, 'PreconditionFailedError')); // 412
            }
        }

        req.origin = {
            application: req.header('x-origin-application'),
            channel: req.header('x-origin-channel'),
            device: req.header('x-origin-device')
        };

        return next();
    }

    itsNotToIgnore(req) {
        const path = req.path().toLowerCase();

        if (this.config.origin.ignoreExact) {
            // ignora exatamente a rota informada
            for (let current_path of this.config.origin.ignoreExact) {
                if (path === current_path.toLowerCase()) return false;
            }
        }

        if (this.config.origin.ignore) {
            // ignora desde a rota informada
            for (let current_path of this.config.origin.ignore) {
                if (path.startsWith(current_path)) return false;
            }
        }

        return true;
    }

    hasApplication(req) {
        return this.config.origin.require.application ? req.header('x-origin-application') : true;
    }

    hasChannel(req) {
        return this.config.origin.require.channel ? req.header('x-origin-channel') : true;
    }

    hasDevice(req) {
        return this.config.origin.require.device ? req.header('x-origin-device') : true;
    }
}

module.exports = new Origin();
