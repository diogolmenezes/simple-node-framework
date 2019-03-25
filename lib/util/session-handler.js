const uuid = require('uuid');
const redis = require('../redis');
const { session: sessionConfig } = require('../config');
const Loggable = require('../base/loggable');
const applicationErrors = require('../errors');

class SessionHandler extends Loggable {
    constructor(_config) {
        super({
            module: 'Session'
        });

        /*
        {
        allowNoKey: Boolean
        }
        */

        const config = Object.assign({}, sessionConfig, _config);

        this.config = config || sessionConfig;
        this.redis = config.redis || redis;
        this.data = {};
        this.key = null;
        this.state = '';
        this.error = null;
    }

    // Cria uma nova sessão no Redis.
    // Se não for chamada pelo menos uma vez a sessão nunca existirá
    new(key, ttl) {
        return new Promise((resolve, reject) => {
            // Se não informar uma chave
            if (!key) {
                // Se não tiver descoberto uma chave
                if (!this.key) {
                    // Criar uma chave aqui
                    if (this.config.allowNoKey) this.key = uuid.v1();
                    else return reject(new Error('Não é possível iniciar uma sessão sem uma chave'));
                }

                key = this.key;
            }

            this.data = {};
            const redisKey = this._generateRedisKey(key);

            const sessionDuration = ttl || this.config.ttl;
            this.redis
                .set(redisKey, this.data, sessionDuration)
                .then((data) => {
                    // Ativa a sessão
                    this.activate();
                    resolve(redisKey);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    start(req, res, next) {
        // transforma este objeto na sessão da requisição
        req.session = this;
        // Entende que o X-CPF é a identificação para carregar a Sessão
        if ('resolveKey' in this.config) {
            // usa o callback se tiver sido definido
            this.key = this.config.resolveKey(req);
        } else if ('headers' in this.config) {
            // a chave 'headers' pode ser um array ou um string
            // se for um array, ele procura até encontrar a primeira
            if (Array.isArray(this.config.headers)) {
                for (const k of this.config.headers) {
                    if (k in req.headers) {
                        this.key = req.headers[k];
                        break;
                    }
                }
            } else this.key = req.headers[this.config.headers];
        }

        if (this.key) {
            res.on('finish', () => {
                // Verifica se é sessão ativa
                if (this.state === 'active') this.update();
            });

            this.load(this.key)
                .then(
                    (success) => {
                        return next();
                    },
                    (err) => {
                        this.setError(err);
                        this.log.error('Exceção encontrada na aplicação', err);
                        next(applicationErrors.throw('Houve um erro na aplicação.', 'InternalServerError'));
                    }
                )
                .catch((err) => {
                    // Erros dentro do 'next'
                    this.setError(err);
                    this.log.error('Exceção encontrada na aplicação', err);
                    applicationErrors.handle(req, res, applicationErrors.throw('Houve um erro na aplicação', 'InternalServerError'));
                });
        } else {
            // não encontrou a chave,
            // apenas passa para o próximo Middleware
            this.inactivate();
            return next();
        }
    }

    load(key) {
        this.key = key;

        return this.redis
            .get(this._generateRedisKey(this.key))
            .then((sessionData) => {
                this.data = sessionData;
                this.activate();

                return true;
            })
            .catch((err) => {
                if (err.code === 'empty_session') {
                    this.setEmpty();

                    return true;
                }

                this.setError(err);

                throw err;
            });
    }

    destroy() {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());
            else {
                const redisKey = this._generateRedisKey(this.key);

                this.redis
                    .del(redisKey)
                    .then((data) => {
                        this.key = null;
                        this.data = {};
                        resolve(data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());
            else if (!key) resolve(this.data);
            else resolve(this.data[key]);
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());

            if (typeof key === 'object') {
                if (!value) {
                    const object = key;
                    this.data = Object.assign({}, this.data, object);
                    resolve(this.data);
                } else reject(new Error('Execução não compreendida'));
            } else {
                this.data[key] = value;
                resolve(this.data);
            }
        });
    }

    contains(key) {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());
            else resolve(key in this.data);
        });
    }

    clear() {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());
            else {
                if (arguments.length > 0) delete this.data[arguments[0]];
                else this.data = {};
                resolve();
            }
        });
    }

    update() {
        return new Promise((resolve, reject) => {
            if (!this.key) reject(this.gerarErroSessaoNaoIniciada());
            else {
                let ttl = null;
                if ('resolveRefreshTtl' in this.config) {
                    ttl = this.config.resolveRefreshTtl(this.data);
                }

                const redisKey = this._generateRedisKey(this.key);
                this.redis
                    .update(redisKey, this.data, ttl)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    _generateRedisKey(key) {
        const prefix = this.config.prefix || 'sess';
        return `${prefix}:${key}`;
    }

    isError() {
        return this.state === 'error';
    }

    isEmpty() {
        return this.state === 'empty';
    }

    isActive() {
        return this.state === 'active';
    }

    isInactive() {
        return this.state === 'inactive';
    }

    activate() {
        this.state = 'active';
    }

    inactivate() {
        this.state = 'inactive';
    }

    setEmpty() {
        this.state = 'empty';
    }

    setError(error) {
        this.error = error;
        this.state = 'error';
    }

    gerarErroSessaoNaoIniciada() {
        const error = new Error('Nenhuma sessão inicializada');
        error.code = 'not-initialized';
        return error;
    }
}

SessionHandler.load = async (cpf, _config, _redis) => {
    const session = new SessionHandler(_config, _redis);
    await session.load(cpf);
    return session;
};

module.exports = SessionHandler;
