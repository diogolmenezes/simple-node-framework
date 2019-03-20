const Loggable = require('./base/loggable');
const applicationErrors = require('./errors');
const jwt = require('jsonwebtoken');
const config = require('./config');
const Helper = require('./util/helpers');
const tokenizer = require('./tokenizer');

// Classe responsavel por realizar a criação e validação de tokens JWT
class Authorization extends Loggable {
    constructor() {
        super({
            module: 'Authorization'
        });
        this.applicationErrors = applicationErrors;
        this.jwt = jwt;
        this.config = config;
    }

    // Cria um novo token JWT.
    // Ex.: Você pode chamar esse método após o seu login e repassar o token gerado
    // através do header "Authorization" para suas rotas protegidas
    createJWT(data, expire = true) {
        const options = expire ? {
            expiresIn: this.config.authorization.jwt.expiresIn
        } : {};

        return this.jwt.sign(data, this.config.authorization.jwt.secret, options);
    }

    // Protege uma rota
    // Para proteger uma rota basta configurar o método protect na definição
    // da rota que deseja proteger, dessa forma ela estará preparada
    // para receber uma autorização através do header "Authorization".
    // Ex.: server.get('/aplicacao/saldo', authorization.protect.bind(authorization), controller.consultarSaldo.bind(controller));
    // curl -H 'Authorization: Bearer um_token_jwt' -X 'GET' localhost:3000/aplicacao/saldo
    protect(req, res, next) {
        const isEnabled = this.config.authorization && this.config.authorization.enabled;
        const hasSentAuthorization = Object.keys(req.authorization).length;

        if (isEnabled) {
            // A propriedade req.authorization é o resultado do parse realizado pelo plugin
            // this.server.use(this.restify.plugins.authorizationParser());  definido nas configurações de middleware do restify
            // caso ele seja desabilitado, podemos recuperar o header direto do header req.header('Authorization')

            if (hasSentAuthorization) {
                switch (this.config.authorization.scheme) {
                    case 'Basic':
                        return this.basicValidate(req, res, next);
                    case 'Bearer':
                        return this.bearerValidate(req, res, next);
                    default:
                        return next(this.applicationErrors.throw('Acesso negado.', 'UnauthorizedError')); // 401
                }
            } else {
                res.header('WWW-Authenticate', `${this.config.authorization.scheme} realm="Acessar API"`);
                return next(this.applicationErrors.throw('Acesso negado.', 'UnauthorizedError')); // 401
            }
        } else {
            return next();
        }
    }

    basicValidate(req, res, next) {
        const { username, password } = req.authorization.basic;

        // ALTERE AQUI, caso você esteja utilizando autenticação basica
        if (username === 'admin' && password === 'admin') {
            req.user = req.username;
            next();
        } else {
            next(this.applicationErrors.throw('Usuário ou senha inválidos.', 'ForbiddenError'));
        }
    }

    // Autenticação customizada para o OiToken
    bearerValidate(req, res, next) {
        const chave = req.authorization.credentials;

        this.jwt.verify(chave, this.config.authorization.jwt.secret, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    next(this.applicationErrors.throw('JWT expirado.', 'ForbiddenError')); // 403
                } else {
                    next(this.applicationErrors.throw('Acesso negado.', 'UnauthorizedError')); // 401
                }
            } else {
                req.user = decoded.data;
                next();
            }
        });
    }

    xCpfValidate(req, res, next) {
        var xcpf = req.header('x-cpf');

        if (!xcpf) {
            return next(this.applicationErrors.throw('Campos obrigatórios não preenchidos.', 'BadRequestError'));
        }

        if (!Helper.validateCPF(xcpf)) {
            return next(this.applicationErrors.throw('Campos obrigatórios mal preenchidos.', 'BadRequestError'));
        }

        return next();
    }

    sessionValidate(req, res, next) {
        if (req.session && req.session.isActive()) {
            next();
        } else {
            this.log.error(`Sessão não está ativa`, req);
            next(this.applicationErrors.throw('Acesso negado.', 'UnauthorizedError')); // 401
        }
    }
}

module.exports = {
    Authorization,
    authorization: new Authorization()
};
