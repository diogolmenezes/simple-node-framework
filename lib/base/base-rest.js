const fetch = require('node-fetch');
const Base = require('./base');
const Helper = require('../util/helpers');

// this class adds base and rest functionalities to rest classes
class BaseRest extends Base {
    constructor({ module }) {
        super({
            module
        });

        this.fetch = fetch;
        this.responseHandler = this.responseHandler.bind(this);
    }

    // handle response
    responseHandler(response, notFoundAsEmpty = false, ignoredStatus = [301, 302]) {
        if (ignoredStatus.includes(response.status)) return Promise.resolve(response);

        if (notFoundAsEmpty && response.status === 404) return Promise.resolve({});

        if (response.ok) {
            return response.json();
        }

        /* eslint-disable no-throw-literal */
        return response
            .json()
            .then((body) => {
                throw {
                    module: this.module,
                    body,
                    statusCode: response.status,
                    statusText: response.statusText
                };
            })
            .catch((erro) => {
                if (erro.statusCode) throw erro;
                else {
                    throw {
                        module: this.module,
                        statusCode: response.status,
                        statusText: response.statusText
                    };
                }
            });
        /* eslint-enable no-throw-literal */
    }

    // replace params in a string
    // ex.: resolveURL('http://google.com/profile/:id', {':id': cpf })
    resolveURL(url, params) {
        return Helper.replaceWith(url, params);
    }

    // wrapper for node-fecth
    _fetch(url, options, respondJson = false) {
        return fetch(url, options).then((response) => {
            if (respondJson) return response.json();
            return response;
        });
    }

    // helper for GET using fetch
    get(url, options, respondJson = false, timeout = null) {
        const _options = options;
        _options.method = 'GET';
        _options.timeout = timeout * 1000 || 8000;
        return this._fetch(url, _options, respondJson);
    }

    // helper for POST using fetch
    post(url, options, respondJson = false, timeout = null) {
        const _options = options;
        _options.method = 'POST';
        _options.timeout = timeout * 1000 || 8000;
        return this._fetch(url, _options, respondJson);
    }
}

module.exports = BaseRest;
