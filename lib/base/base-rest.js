const Base = require("./base");
const fetch = require("node-fetch");
const Helper = require("../util/helpers");

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
    responseHandler(
        response,
        notFoundAsEmpty = false,
        ignoredStatus = [301, 302]
    ) {
        if (ignoredStatus.includes(response.status))
            return Promise.resolve(response);

        if (notFoundAsEmpty && response.status === 404)
            return Promise.resolve({});

        if (response.ok) {
            return response.json();
        }

        return response
            .json()
            .then(body => {
                throw {
                    module: this.module,
                    body,
                    statusCode: response.status,
                    statusText: response.statusText
                };
            })
            .catch(erro => {
                if (erro.statusCode) throw erro;
                else {
                    throw {
                        module: this.module,
                        statusCode: response.status,
                        statusText: response.statusText
                    };
                }
            });
    }

    // replace params in a string
    // ex.: resolveURL('http://google.com/profile/:id', {':id': cpf })
    resolveURL(url, params) {
        return Helper.replaceWith(url, params);
    }

    // wrapper for node-fecth
    _fetch(url, opts, respond_json = false) {
        return fetch(url, opts).then(response => {
            if (respond_json) return response.json();
            return response;
        });
    }

    // helper for GET using fetch
    get(url, opts, respond_json = false, timeout = null) {
        opts.method = "GET";
        opts.timeout = timeout * 1000 || 8000;
        return this._fetch(url, opts, respond_json);
    }

    // helper for POST using fetch
    post(url, opts, respond_json = false, timeout = null) {
        opts.method = "POST";
        opts.timeout = timeout * 1000 || 8000;
        return this._fetch(url, opts, respond_json);
    }
}

module.exports = BaseRest;
