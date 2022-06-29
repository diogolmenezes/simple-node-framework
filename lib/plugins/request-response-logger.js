const Helpers = require('../util/helpers');
const config = require('../config');

// this class configure request/response automatic logs
class RequestAndResponseLogger {
    // configure the middlewares
    static configure(server) {
        server.use(RequestAndResponseLogger.request);
        server.on('after', RequestAndResponseLogger.response);
    }

    // log the request
    static request(req, res, next) {
        if (!RequestAndResponseLogger.ignoreUrl(req.url)) {
            const requestId = Helpers.requestId(req);
            const requestIp = RequestAndResponseLogger.ip(req);
            const user = req.authorization.basic.username;
            const request = `REQUEST ${requestId} - ${req.method} ${req.url} - Ip [${requestIp}] - Body [${JSON.stringify(req.body)}] - Header [${JSON.stringify(req.headers)}] - User [${user}]`;
            req.log.debug('RequestAndResponseLogger', request, { natural: { requestId, requestIp, user } });
        }
        return next();
    }

    // log the response
    static response(req, res, route) {
        if (!RequestAndResponseLogger.ignoreUrl(req.url)) {
            const { versions } = route ? route.spec : '';
            const requestId = Helpers.requestId(req);
            const requestIp = RequestAndResponseLogger.ip(req);
            const user = req.authorization.basic.username;

            // do not log in to some answers, depending on the content type
            let data = res._data;
            if (res._headers['content-type'] === 'application/javascript') {
                data = 'application/javascript';
            }

            const response = `RESPONSE ${requestId} - ${req.method} ${req.url} - Version [${versions}] - Status [${res.statusCode}] - Ip [${requestIp}] - Body [${data}] - Header [${res._header}] - User [${user}]`;
            req.log.debug('RequestAndResponseLogger', response, { natural: { responseStatusCode: String(res.statusCode), requestIp, requestId, user } });
        }
    }

    static ignoreUrl(url) {
        const ignoreRoutes = config.log.requestResponse && config.log.requestResponse.ignore && config.log.requestResponse.ignore.length > 0;
        return ignoreRoutes && (config.log.requestResponse.ignore.includes('*') || config.log.requestResponse.ignore.includes(url));
    }

    // get user Ip address
    static ip(req) {
        let ip = '';

        try {
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        } catch (err) {
            // ignora os erros de recuperação de IP
        }

        return ip;
    }
}

module.exports = RequestAndResponseLogger;
