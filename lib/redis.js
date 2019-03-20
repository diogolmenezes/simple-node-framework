const Loggable = require('./base/loggable');
const config = require('./config');
const RedisClient = require('ioredis');

class Redis extends Loggable {
    constructor() {
        super({
            module: 'Redis'
        });

        this.config = config;
        this.redisConfig = config.redis;
        this.client = null;
        this.connected = false;
    }

    configure() {
        if (this.config.redis) {
            const source = this.config.redis.host ? `${this.config.redis.host}:${this.config.redis.port}` : this.config.redis.name;

            this.log.debug(`Tentando conectar no REDIS [${source}]`);

            // 24 horas em segundos
            if (!('ttl' in this.config.redis)) this.config.redis.ttl = 60 * 60 * 24;

            this.client = new RedisClient(this.config.redis);

            this.client.on('end', () => {
                this.log.debug(`A conexão com o REDIS foi finalizada. [${source}]`);
                this.connected = false;
            });

            this.client.on('connect', () => {
                this.log.debug(`A conexão com o REDIS foi estabelecida. [${source}]`);
                this.connected = true;
            });

            return this;
        }

        console.log('Nenhuma configuração de REDIS encontrada');
        return null;
    }

    close() {
        if (this.client)
            this.client.quit();
    }

    delPattern(pattern) {
        return this.client.keys(pattern).then((keys) => {
            // Use pipeline instead of sending
            // one command each time to improve the
            // performance.
            var pipeline = this.client.pipeline();
            keys.forEach(function (key) {
                pipeline.del(key);
            });
            return pipeline.exec();
        });
    }

    del(key) {
        if (this.redisConfig.mock) {
            delete this.redisConfig.mock[key];
            return Promise.resolve(this.redisConfig.mock);
        }

        return new Promise((resolve, reject) => {
            this.client.del(key, (err, data) => {
                if (!err) resolve(data);
                else reject(err);
            });
        });
    }

    set(key, object, ttl = null) {
        if (this.redisConfig.mock) {
            this.redisConfig.mock[key] = object;
            return Promise.resolve(this.redisConfig.mock);
        }

        return new Promise((resolve, reject) => {
            const input = JSON.stringify(object);
            // Salva o valor no Redis com o TTL passado,
            // ou o definido no arquivo de configuração,
            // ou o padrão de 24 horas
            this.client.set(key, input, 'EX', ttl || this.config.redis.ttl, (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    err.app_message = 'Não foi possível salvar os dados no Redis';
                    err.code = 'redis_error';
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                }
            });
        });
    }

    get(key) {
        if (this.redisConfig.mock) {
            if (this.redisConfig.mock[key]) return Promise.resolve(this.redisConfig.mock[key]);
            const err = new Error('Nenhum registro encontrado para este token');
            err.code = 'empty_session';
            return Promise.reject(err);
        }

        return new Promise((resolve, reject) => {
            this.client.get(key, (err, data) => {
                if (!err) {
                    if (data) {
                        try {
                            // Tenta fazer o parse do JSON
                            var output = JSON.parse(data);
                            resolve(output);
                        } catch (err) {
                            // Rejeita se não conseguir realizar o parse
                            err.app_message = 'Erro de formatação do JSON';
                            err.code = 'format_error';
                            this.log.error('Erro no framework - Redis', err);
                            reject(err);
                        }
                    } else {
                        // Rejeita se a chave não estiver no Redis
                        var err = new Error('Nenhum registro encontrado para este token');
                        err.code = 'empty_session';
                        reject(err);
                    }
                } else {
                    // Problema no acesso ao Redis
                    err.app_message = 'Erro ao ler dados no Redis';
                    err.code = 'redis_error';
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                }
            });
        });
    }

    update(key, object, ttl) {
        return new Promise((resolve, reject) => {
            // Recebe o objeto salvo no Redis

            this.get(key)
                .then((data) => {
                    object = Object.assign({}, data, object);
                    return this.set(key, object, ttl);
                })
                .then((data) => {
                    // Salva o objeto no Redis
                    resolve(data);
                })
                .catch((err) => {
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                });
        });
    }
}

module.exports = new Redis();
