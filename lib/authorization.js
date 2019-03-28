const jwt = require('jsonwebtoken');
const Loggable = require('./base/loggable');
const config = require('./config');
const errorHandler = require('./error').instance;

// this class abstracts the authorization concept
class Authorization extends Loggable {
    constructor() {
        super({
            module: 'SNF Authorization'
        });
        this.errorHandler = errorHandler;
        this.jwt = jwt;
        this.config = config;
    }

    // create JWT token
    // Ex.: You can call this method after your login process and than send the generated token in the 'Authorization' header for the protected routes
    createJWT(data, expire = true) {
        const options = expire ? { expiresIn: this.config.authorization.jwt.expiresIn } : {};
        return this.jwt.sign(data, this.config.authorization.jwt.secret, options);
    }

    // to protect a route you have to call this middleware at the route definition. after this,
    // it will be prepared to receive the 'Authorization' header
    // Ex.: server.get('/my-application/api/sample-module', authorization.protect.bind(authorization), (req, res, next) => { ... });
    // curl -H 'Authorization: Bearer some_jwt_token' -X 'GET' localhost:8080/my-application/api/sample-module
    protect(req, res, next) {
        const isEnabled = this.config.authorization && this.config.authorization.enabled;
        const hasSentAuthorization = Object.keys(req.authorization).length;

        if (isEnabled) {
            // the req.authorization property is injected by authorizationParser plugin. if you dont want to use this plugin
            // you have to get the header this way: req.header('Authorization')
            if (hasSentAuthorization) {
                switch (req.authorization.scheme) {
                    case 'Basic':
                        return this.basicValidate(req, res, next);
                    case 'Bearer':
                        return this.bearerValidate(req, res, next);
                    default:
                        return next(this.errorHandler.throw('Authorization sheme defined in configuration file is not valid', 'UnauthorizedError')); // 401
                }
            } else {
                res.header('WWW-Authenticate', `${req.authorization.scheme} realm='Get API'`);
                return next(this.errorHandler.throw('You did not sent the authorization header', 'UnauthorizedError')); // 401
            }
        } else {
            return next();
        }
    }

    // do the basic validation of credentials
    basicValidate(req, res, next) {
        const { username, password } = req.authorization.basic;

        if (username === this.config.authorization.basic.username && password === this.config.authorization.basic.password) {
            req.user = req.username;
            next();
        } else {
            next(this.errorHandler.throw('Invalid username or password', 'ForbiddenError'));
        }
    }

    // do the bearer validation of credentials
    // sample jwt: eyJhbGciOiJIUzI1NiJ9.bm90aGluZw.pncy0bQ9c9J4AAuQQfnJNtH8LBV1FiuPJBxfJbzlIFA
    bearerValidate(req, res, next) {
        const key = req.authorization.credentials;

        this.jwt.verify(key, this.config.authorization.jwt.secret, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    next(this.errorHandler.throw('Expired JWT.', 'ForbiddenError')); // 403
                } else {
                    next(this.errorHandler.throw('Invalid JWT', 'UnauthorizedError')); // 401
                }
            } else {
                req.user = decoded.data;
                next();
            }
        });
    }
}

module.exports = {
    class: Authorization,
    instance: new Authorization()
};
