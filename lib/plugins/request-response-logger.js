const Helpers = require('../util/helpers');
const config = require('../config');
const Base = require('../base/base');

// this class configure request/response automatic logs
class RequestAndResponseLogger extends Base  {
    constructor() {
        super({
            module: 'RequestAndResponseLogger'
        });
    }

    write(req, res, next) {    
        this.logRequest(req, res, next)
        res.on("finish", () => {
            this.logResponse(req, res)
        });
        next()
    }

    // log the request
    logRequest(req, res, next) {
        if (!this.ignoreUrl(req.url)) {
            const requestId = Helpers.requestId(req);
            const requestIp = this.ip(req);
            const requestPath = req.route ? req.route.path : '';
            const user = req.authorization && req.authorization.basic ? req.authorization.basic.username : '';
            const request = `REQUEST ${requestId} - ${req.method} ${req.url} - Ip [${requestIp}] - Body [${JSON.stringify(req.body)}] - Header [${JSON.stringify(req.headers)}] - User [${user}]`;
            this.log.debug(request, { natural: { requestId, requestIp, user, requestPath } });
        }
    }

    // log the response
    logResponse(req, res, route) {
        if (!this.ignoreUrl(req.url)) {
            const { versions } = route ? route.spec : '';
            const requestId = Helpers.requestId(req);
            const requestIp = this.ip(req);
            const requestPath = req.route ? req.route.path : '';
            const user = req.authorization && req.authorization.basic ? req.authorization.basic.username : '';

            // do not log in to some answers, depending on the content type
            let data = res._data;
            if (res._headers['content-type'] === 'application/javascript') {
                data = 'application/javascript';
            }

            const response = `RESPONSE ${requestId} - ${req.method} ${req.url} - Version [${versions}] - Status [${res.statusCode}] - Ip [${requestIp}] - Body [${data}] - Header [${res._header}] - User [${user}]`;
            this.log.debug(response, { natural: { responseStatusCode: String(res.statusCode), requestIp, requestId, user, requestPath } });
        }
    }

    ignoreUrl(url) {
        const ignoreRoutes = config.log.requestResponse && config.log.requestResponse.ignore && config.log.requestResponse.ignore.length > 0;
        return ignoreRoutes && (config.log.requestResponse.ignore.includes('*') || config.log.requestResponse.ignore.includes(url));
    }

    // get user Ip address
    ip(req) {
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
