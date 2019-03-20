const config = require('./config');
const restify = require('restify');
const logger = require('./log');
const origin = require('./plugins/origin');
const restifyAudit = require('./restify-audit');
const RequestAndResponseLogger = require('./plugins/request-response-logger');
const corsMiddleware = require('restify-cors-middleware');

// Classe responsavel por criar e configurar a instância do restify
// A documentação do restify pode ser encontrada em http://restify.com/
class RestifyConfig {
    constructor() {
        this.config = config;
        this.restify = restify;
        this.server = null;
        this.logger = logger;
        this.origin = origin;
    }

    configure() {
        this.server = this.restify.createServer({
            log: this.logger
        });

        this.applyMiddlewares();

        this.applyAudit();

        return this.server;
    }

    applyAudit() {
        // habilita ou não a auditoria do restify
        if (this.config.audit && this.config.audit.enabled) {
            restifyAudit.configure(this.server);
        }
    }

    // use este método para incluir seus middlewares e plugins, cuidado
    // com a ordem de inclusão, isso pode quebrar o fluxo de execução.
    // http://restify.com/docs/plugins-api/
    applyMiddlewares() {
        this.server.use(this.restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(this.restify.plugins.authorizationParser());
        this.server.use(this.restify.plugins.gzipResponse());
        this.server.use(this.restify.plugins.queryParser());
        this.server.use(this.restify.plugins.bodyParser());
        
        // Quantidade de requisições por usuário e intervalo de tempo
        this.config.throttle && this.server.use(this.restify.plugins.throttle(this.config.throttle));

        // habilitando o logs do request e do response
        RequestAndResponseLogger.configure(this.server);

        // habilitando o plugin de origem
        this.server.use(this.origin.proccess.bind(this.origin));

        // Cors
        this.config.cors && this.applyCORS(this.config.cors);
    }

    applyCORS(corsConfig) {
        const cors = corsMiddleware(this.config.cors);
        this.server.pre(cors.preflight);
        this.server.use(cors.actual);
    }
}

module.exports = RestifyConfig;
