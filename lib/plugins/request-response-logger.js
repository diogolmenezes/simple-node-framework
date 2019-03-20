const Helpers = require('../util/helpers');

// Essa classe é responsável por configurar os logs dos requests e dos responses
// utilizando o logger padrão definido na criação do server do restify.
class RequestAndResponseLogger {
    static configure(server) {
        server.use(RequestAndResponseLogger.request);
        server.on('after', RequestAndResponseLogger.response);
    }

    static request(req, res, next) {
        const requestId = Helpers.requestId(req);
        const request = `REQUEST ${requestId} - ${req.method} ${req.url} - Ip [${RequestAndResponseLogger.ip(req)}] - Body [${JSON.stringify(req.body)}] - Header [${JSON.stringify(req.headers)}]`;
        req.log.debug('RequestAndResponseLogger', request);
        return next();
    }

    static response(req, res, route, err) {
        const { versions } = route ? route.spec : '';
        const requestId = Helpers.requestId(req);

        // Não loga algumas respostas, dependendo do content-type
        let data = res._data;
        if (res._headers['content-type'] === 'application/javascript') {
            data = 'application/javascript';
        }

        const response = `RESPONSE ${requestId} - ${req.method} ${req.url} - Version [${versions}] - Status [${res.statusCode}] - Ip [${RequestAndResponseLogger.ip(req)}] - Body [${data}] - Header [${res._header}]`;
        req.log.debug('RequestAndResponseLogger', response);
    }

    static ip(req) {
        let ip = '';

        try {
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        }
        catch(err) {
            // ignora os erros de recuperação de IP
        }

        return ip;
    }
}

module.exports = RequestAndResponseLogger;
