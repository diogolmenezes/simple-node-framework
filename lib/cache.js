const redis = require('./redis');
const config = require('./config');
const Loggable = require('./base/loggable');
const applicationErrors = require('./errors');

class Cache extends Loggable {
    constructor(_config) {
        super({
            module: 'Cache Handler'
        });

        this.redis = redis;
        this.config = _config;
        this.key = null;
        this.applicationErrors = applicationErrors;
        this.noCache = false;
        this.noStore = false;
    }

    _resolveCacheControl(headers) {
        let cacheControl = null;
        for (var k in headers) {
            if (k.toLowerCase() === 'cache-control') {
                cacheControl = headers[k];
                break;
            }
        }

        if (cacheControl) {
            // Removendo os ; , reduzindo as letras para minúsculas, dividindo nas , e removendo os espaços em branco
            const directives = cacheControl.replace(/;/g, '').toLowerCase().split(',').map(directive => directive.trim());
            this.noCache = directives.includes('no-cache');
            this.noStore = directives.includes('no-store');
        }
    }

    start(req, res, next) {
        this.key = this._generateKey(req);
        this._resolveCacheControl(req.headers);
        req.cache = this;
        next();
    }

    load(req, res, next) {
        if (this.noCache) {
            // Se no-cache, não carrega o cache
            this.log.debug(`Client-Control definido com [no-cache] para a rota [${req.method}] [${req.url}] e chave [${this.key}]`);
            next();
        } else {
            this.redis.get(this.key)
                .then((cache) => {
                    // Cache encontrado
                    const framework = this.config.framework || 'restify';
                    if (framework === 'restify') {
                        res.send(cache.status, cache.body, cache.headers);
                    } else {
                        res.status(cache.status).set(cache.headers).send(cache.body);
                    }
                }, (err) => {
                    if (err.code === 'empty_session') {
                        // Não encontrou cache
                        return next();
                    }

                    // Erro no carregamento
                    return next(this.applicationErrors.throw('Houve um erro na aplicação', 'InternalServerError'));
                })
                .catch((err) => {
                    // Erro no next
                    return this.applicationErrors.send(req, res, err, this.applicationErrors.throw('Houve um erro na aplicação', 'InternalServerError'));
                });
        }
    }

    save(body, headers, _status, ttl) {
        // Se no-store, não salva o cache
        if (this.noStore) {
            return Promise.resolve(false);
        }

        // Status da resposta
        const status = _status || 200;
        const _ttl = ttl || this.config.ttl || 60 * 60;

        const cache = {
            body,
            headers,
            status
        };

        // TTL informado, do arquivo de configuração ou 1 hora
        return this.redis.set(this.key, cache, _ttl);
    }

    _generateKey(req) {
        const key     = this.config.resolveKey(req);
        const method  = req.method;
        const route   = `${req.url.replace(/^\/|\/$/g, '')}`;
        const prefix  = this.config.prefix || 'easy-framework';
        const appName = this.config.app_name;
        return `${prefix}:${key}:cache:${appName}:${method}:${route}`.toLowerCase();
    }
}

module.exports = {
    start: (_config) => {
        _config = Object.assign({ app_name: config.app.name }, config.cache || {}, _config);
        return (req, res, next) => {
            const cache = new Cache(_config);
            cache.start(req, res, next);
        };
    },
    load: () => {
        return (req, res, next) => {
            req.cache.load(req, res, next);
        };
    }
};
