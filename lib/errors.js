const Loggable = require('./base/loggable');
const restifyErrors = require('restify-errors');

// Classe responsavel por gerenciar os erros da aplicação,
// diferenciando erros de negócio de erros inesperados
class ApplicationErrors extends Loggable {
    constructor() {
        super({
            module: 'Error Handler'
        });
        this.restifyErrors = restifyErrors;
        this.defineCustomErros();
    }

    defineCustomErros() {
        // coloque aqui seus erros customizados para poder
        // instanciar em qualquer lugar da aplicação.
        //
        this.restifyErrors.makeConstructor('TokenInvalidoError', {
            statusCode: 404,
            failureType: 'motion'
        });

        this.restifyErrors.makeConstructor('BusinessError', {
            statusCode: 500,
            failureType: 'motion'
        });

        //
        // this.restifyErrors.makeConstructor('CpfInvalidoError', {
        //     statusCode: 400,
        //     failureType: 'motion'
        // });
        //
        // Ex.: applicationError.throw('Formato de CPF inválido', 'CpfInvalidoError')
    }

    // lança exceptions compatíveis com restify
    // caso chame throw com apenas uma string, ele lançara
    // automaticamente um BusinessError
    throw(error, type) {
        const isError = error instanceof Error;
        const isResityError = error.body;

        if (isError) {
            if (!isResityError) {
                return new this.restifyErrors.InternalServerError({
                    cause: error
                }, error.message);
            }

            return error;

            // return new this.restifyErrors.makeErrFromCode(500, {
            //     message: 'Erro inesperado',
            //     stack: error.stack
            // });
        }

        if (!type) {
            return new this.restifyErrors['BusinessError'](error);
        }

        return new this.restifyErrors[type](error);
    }

    // loga automaticamente os erros lançados pelo sistema
    handle(req, res, error, callback) {
        this.log.error(error.message, {
            path: req.path(),
            stack: error.stack,
            error
        });

        // Ex.: caso queira fazer algum handle diferenciado
        // dos seus erros, você pode fazer aqui:
        // comunicarAdministrador(error);
        // atualizarEstatisticas(error);

        if (typeof (callback) === 'function') callback(req, res, error);
        else res.send(error.statusCode || 500);
    }

    // loga automaticamente os erros lançados pelo sistema
    send(req, res, error, respond_with) {
        this.log.error(error.message, {
            path: req.path(),
            stack: error.stack,
            error
        });

        if (!(respond_with instanceof Error)) {
            respond_with = new Error(respond_with || '');
        }

        res.send(respond_with.statusCode || 500, respond_with.message);
    }
}

module.exports = new ApplicationErrors();
