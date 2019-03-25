const Loggable = require('./base/loggable');
const redis = require('./redis');
const config = require('./config');

class Session extends Loggable {
    constructor(req) {
        super({
            module: 'SNF Session'
        });
        this.data = {};
        this.redis = redis;
        this.config = config;
        this.req = req;
    }

    // creates a new session
    async create(identifier) {
        const { key, identifier: id } = this.getSessionKey(identifier);
        this.data = { identifier: id, key };
        return this.set(key, this.data);
    }

    // loads the session to request object
    async load(identifier) {
        const { key } = this.getSessionKey(identifier);
        this.data = await this.get(key);
        this.req.session = this;
    }

    // updates the current session
    async update() {
        return this.set(this.data.key, this.data);
    }

    // sets a value on redis
    async set(key, value) {
        return this.redis.set(key, value, this.config.session.ttl).catch((error) => {
            this.log.error('Unespected error on session load', error);
            throw error;
        });
    }

    // gets a value from redis
    async get(key) {
        return this.redis.get(key).catch((error) => {
            if (error.code === 'no_key_found') return {};
            this.log.error('Unespected error on session load', error);
            throw error;
        });
    }

    destroy(identifier) {
        const { key } = this.getSessionKey(identifier);
        this.redis
            .del(key)
            .then(() => {
                this.data = undefined;
                this.req.session = undefined;
            })
            .catch((error) => {
                this.log.error('Unespected error on session destroy', error);
                throw error;
            });
    }

    // get an session key like "simple-node-framework-session:diogolmenezes"
    getSessionKey(identifier) {
        const headerKey = this.config.session.headerKey ? this.req.headers[this.config.session.headerKey] : undefined;
        const key = identifier || headerKey;
        const prefix = this.config.session.prefix || 'simple-node-framework';
        return {
            identifier: key,
            key: `${prefix}-session:${key}`
        };
    }
}

module.exports = Session;
