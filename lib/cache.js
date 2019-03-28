const redis = require('./redis');
const Loggable = require('./base/loggable');
const config = require('./config');
const applicationErrors = require('./errors');

// abstracts the request/response cache concept
class Cache extends Loggable {
    constructor() {
        super({
            module: 'SNF Cache'
        });

        this.config = config;
        this.redis = redis;
        this.applicationErrors = applicationErrors;
    }

    // save response to cache
    saveResponse(status, body, headers, req, ttl) {
        // build the key to save in cache
        const key = this.getCacheKey(req);

        // dont store in cache if no-store
        if (this.hasCacheControl(req.headers, 'no-store')) {
            this.log.debug(`The cache will not be saved because no-store was defined [${key}]`);
            return Promise.resolve(false);
        }

        const _status = status || 200;
        const saveTtl = ttl || this.config.cache.ttl || 60 * 60;

        const cache = {
            body,
            headers,
            status: _status
        };


        return this.redis.set(key, cache, saveTtl);
    }

    // load response from de cache
    loadResponse(req, res, next) {
        // build the key to sabe in cache
        const key = this.getCacheKey(req);

        // dont get from cache if no-cache
        if (this.hasCacheControl(req.headers, 'no-cache')) {
            this.log.debug(`The cache will not be loaded because no-cache was defined [${key}]`);
            return next();
        }

        return this.redis
            .get(key)
            .then(
                (cache) => {
                    const framework = this.config.framework || 'restify';
                    if (framework === 'restify') {
                        res.send(cache.status, cache.body, cache.headers);
                    } else {
                        res.status(cache.status)
                            .set(cache.headers)
                            .send(cache.body);
                    }
                },
                (err) => {
                    if (err.code === 'no_key_found') return next();
                    return next(this.applicationErrors.throw(`Error on loading [${key}] from cache`, 'InternalServerError'));
                }
            )
            .catch((err) => {
                return this.applicationErrors.send(req, res, err, this.applicationErrors.throw(`Unexpected error on cache [${key}]`, 'InternalServerError'));
            });
    }

    // load response to use add this to your routes file: Cache.loadResponse
    static loadResponse(req, res, next) {
        req.cache.loadResponse(req, res, next);
    }

    // only a alias for redis set
    save(key, value, ttl) {
        return this.redis.set(key, value, ttl);
    }

    // only a alias for redis get
    load(key) {
        return this.redis.get(key);
    }

    // get an cache key like "simple-node-framework:cache:my-application:get:api/sample-module"
    getCacheKey(req) {
        const { method } = req;
        const route = `${req.url.replace(/^\/|\/$/g, '')}`;
        const prefix = this.config.cache.prefix || 'simple-node-framework';
        const appName = this.config.app.name;
        const headerKey = this.config.cache.headerKey ? `${req.headers[this.config.cache.headerKey]}:` : '';
        return `${prefix}:${headerKey}cache:${appName}:${method}:${route}`.toLowerCase();
    }

    // verify if a key its in cache-control header
    hasCacheControl(headers, key) {
        const cacheControl = headers && headers['cache-control'] ? headers['cache-control'] : '';
        return cacheControl.toLowerCase().includes(key);
    }
}

module.exports = Cache;
