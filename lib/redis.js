const Loggable = require('./base/loggable');
const config = require('./config');

// this class abstract the redis concept
// its possible use mock, enable redis.mock at configuration file
class Redis extends Loggable {
    constructor() {
        super({
            module: 'SNF Redis'
        });

        this.config = config.redis || {};
        this.client = null;
        this.connected = false;
    }

    // connect to the redis instance
    connect() {
        return new Promise((resolve, reject) => {
            if (this.config) {
                const RedisClient = require('ioredis'); // eslint-disable-line

                const source = this.config.host ? `${this.config.host}:${this.config.port}` : this.config.name;

                // 24 hours in seconds
                if (!('ttl' in this.config)) this.config.ttl = 60 * 60 * 24;
                try {
                    this.client = new RedisClient(this.config);

                    this.client.on('end', () => {
                        this.log.debug(`Disconected from REDIS [${source}]`);
                        this.connected = false;
                    });

                    this.client.on('connect', () => {
                        this.log.debug(`Connected at REDIS [${source}]`);
                        this.connected = true;
                        resolve(this);
                    });
                } catch (erro) {
                    reject(erro);
                }
            } else {
                resolve(null);
            }
        });
    }

    isConnected() {
        return this.connected;
    }

    // close redis connection
    close() {
        const _redis = this;
        return new Promise(async (resolve, reject) => {
            try {
                _redis.client.on('end', () => resolve(_redis.client))

                if (_redis.client && _redis.client.status !== 'end') {
                    await _redis.client.quit();
                }
            } catch (erro) {
                reject(erro);
            }
        })
    }

    // remove many keys from redis using patterns
    delPattern(pattern) {
        // if mock is enabled, use memory instead of redis
        if (this.config.mock) {
            Object.keys(this.config.mock).forEach((key) => {
                if (new RegExp(`^${pattern.split('*').join('.*')}$`).test(key)) {
                    delete this.config.mock[key];
                }
            });
            return Promise.resolve(this.config.mock);
        }

        return this.client.keys(pattern).then((keys) => {
            const pipeline = this.client.pipeline();
            keys.forEach((key) => {
                pipeline.del(key);
            });
            return pipeline.exec();
        });
    }

    // remove key from redis
    del(key) {
        // if mock is enabled, use memory instead of redis
        if (this.config.mock) {
            delete this.config.mock[key];
            return Promise.resolve(this.config.mock);
        }

        return new Promise((resolve, reject) => {
            this.client.del(key, (err, data) => {
                if (!err) resolve(data);
                else reject(err);
            });
        });
    }

    // set value in redis
    set(key, object, ttl = null) {
        // if mock is enabled, use memory instead of redis
        if (this.config.mock) {
            this.config.mock[key] = object;
            return Promise.resolve(this.config.mock);
        }

        return new Promise((resolve, reject) => {
            const input = JSON.stringify(object);

            this.client.set(key, input, 'EX', ttl || this.config.ttl, (error, data) => {
                if (!error) {
                    resolve(data);
                } else {
                    this.log.error('Could not write data to redis', error);
                    reject(error);
                }
            });
        });
    }

    // get values from redis
    get(key) {
        // if mock is enabled, get values from memory instead of redis
        if (this.config.mock) {
            if (this.config.mock[key]) return Promise.resolve(this.config.mock[key]);
            const error = new Error(`There is no redis key for [${key}]`);
            error.code = 'no_key_found';
            return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
            this.client.get(key, (error, data) => {
                if (!error) {
                    if (data) {
                        try {
                            const output = JSON.parse(data);
                            resolve(output);
                        } catch (parseError) {
                            this.log.error(`Parse error for redis key [${key}]`, parseError);
                            reject(parseError);
                        }
                    } else {
                        const notFoundError = new Error(`There is no redis key for [${key}]`);
                        notFoundError.code = 'no_key_found';
                        reject(notFoundError);
                    }
                } else {
                    this.log.error(`Redis is not working when retreiving key [${key}]`, error);
                    reject(error);
                }
            });
        });
    }
}

module.exports = {
    class: Redis,
    instance: new Redis()
};
