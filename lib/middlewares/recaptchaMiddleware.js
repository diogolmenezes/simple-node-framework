const BaseRest = require('../base/base-rest');
const config = require('../config');
const applicationError = require('../errors');
const URLSearchParams = require('url-search-params');
const HttpsProxyAgent = require('https-proxy-agent');

class RecaptchaMiddleware extends BaseRest {
    constructor() {
        super({
            module: 'Recaptcha Middleware'
        });
        this.config = config;
        this.applicationError = applicationError;
    }

    createPayload(captcha) {
        const params = new URLSearchParams();
        params.set('secret', this.config.recaptcha.secret);
        params.set('response', captcha);
        return params;
    }

    async validar(res, req, next) {
        const { token } = res.body;
        try {
            if (!this.config.recaptcha.active) {
                return next();
            }
            const { proxy } = this.config.recaptcha;
            const requestMetaData = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.createPayload(token),
                agent: ((proxy) ? new HttpsProxyAgent(proxy) : undefined)
            };
            const url = this.config.recaptcha.endpoint;

            this.log.debug(`Chamando serviço recaptcha validate [${url}]`, requestMetaData);
            const dataEnvio = this.timer.start();

            const response = await this.fetch(url, requestMetaData);

            this.timer.writeLog(dataEnvio, 'RecaptchaMiddleware', 'validando recaptcha');

            const jsonBody = await response.json();
            if (response.ok && jsonBody.success) {
                this.log.debug('Rest de validação do recaptcha retornou sucesso', jsonBody);
                return next();
            }
            throw new Error(JSON.stringify(jsonBody));
        } catch (err) {
            this.log.error('Ocorreu um erro no rest recaptcha', err);
            return next(this.applicationError.throw('Erro ao validar o captcha.', 'ForbiddenError')); // 403
        }
    }
}

module.exports = new RecaptchaMiddleware();
