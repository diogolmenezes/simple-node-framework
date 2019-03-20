const Loggable = require('./base/loggable');
const config = require('./config');
const applicationErrors = require('./errors');
const configFramework = require('../config/config-framework');
const BaseRest = require('./base/base-rest');
const queryString = require('query-string');

class Tokenizer extends Loggable {
    constructor(redis, config) {
        super({
            module: 'Tokenizer'
        });

        this.rest = new BaseRest('Tokenizer Rest');
        this.config = configFramework.rest.tokenizer;
    }

    set(data) {
        const resource = this.config.getToken;
        return this.rest.fetch(this.rest.resolveURL(resource.endpoint, { ':host': this.config.host }), {
            method: resource.method,
            body: queryString.stringify(data),
            headers: {
                'Content-Type': resource['Content-Type'],
                chave: resource.chave
            }
        }).then((response) => {
            // Retira o token do HEADER
            return response.headers._headers.accesskey[0];
        });
    }

    get(token) {
        this.log.debug(`Iniciando chamada ao getDados no serviço Tokenizer ${token}`);

        const resource = this.config.getDados;
        return this.rest.fetch(this.rest.resolveURL(resource.endpoint, { ':host': this.config.host }), {
            method: resource.method,
            headers: {
                'Content-Type': resource['Content-Type'],
                chave: resource.chave,
                accesskey: token
            },
            timeout: 10000 //10s em ms
        }).then((response) => {
            return response.text()
                .then((body) => {
                    this.log.debug(`Resposta da chamada ao getDados no serviço Tokenizer ${token}`, { body, headers: response.headers._headers, status: response.status, text: response.statusText });

                    const json = JSON.parse(body);
                    if (response.status === 200) {
                        return json;
                    }

                    const error = new Error(`Erro ao acessar o tokenizer: ${response.status} ${response.statusText} ${json.msg}`);
                    error.body = json;
                    error.statusText = response.statusText;

                    throw error;
                });
        });
    }
}

module.exports = new Tokenizer();
