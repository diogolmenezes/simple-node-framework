const express = require('express');
const bunyan = require('bunyan');
const os = require('os');
const Base = require('./base/base');
const Cache = require('./cache');
const Session = require('./session');
const config = require('./config');
const Authorization = require('./authorization').class;
const origin = require('./plugins/origin').instance;
const logger = require('./log').instance;
const route = require('./route').instance;
const database = require('./database').instance;
const redis = require('./redis').instance;
const queue = require('./queue').instance;
const errorHandler = require('./error').instance;
const compression = require('compression')
const bodyParser = require('body-parser')
const RequestAndResponseLogger = require('./plugins/request-response-logger');

// this class abstracts the web server concept.
class Server extends Base {
    constructor({ module = 'SNF Server' } = {}) {
        super({
            module
        });
      
        this.config = config;
        this.baseServer = express();
        this.server = null;
        this.origin = origin;
        this.route = route;
        this.module = module;
        this.healthCheckUrl = this.config.app.healthCheck || '/';
        this.middlewares = {
            bodyParser: bodyParser,
            compression,
            logMiddleware: (req, res, next) => {
                req.log = logger; 
                next(); 
            }
        }
        this.plugins = {
            requestAndResponseLogger: new RequestAndResponseLogger()
        }
    }

    // configure server, middlewares, cors, error handle and audit
    configure(options = { port: 8080, httpsOptions: null, listenCallBack: null, afterListenCallback: null }) {
        this.server = this.baseServer;

        this.configureMiddlewares();

        this.listen(options.port, options.listenCallBack, options.afterListenCallback);

        return this.server;
    }

    // configure webserver events
    configureWebServer() {
        // close server event
        process.on('exit', () => {            
            this.log.debug('Bye bye!');
        });

        process.on('SIGINT', () => {
            this.log.debug(`The application has been terminated`);            
            this.log.debug('Closing servers and connections...');            
            this.listener.close(() => {                
                database.close();
                redis.close();
                queue.close();
                this.log.debug('Done!');
                process.exit(0)
            })      
        });
    }

    // override this method to include or change the order of your middleware and plugins
    configureMiddlewares() {
        // applying the web server plugins
        this.server.use(this.middlewares.logMiddleware)
        
        this.server.use(Authorization.parse);

        this.server.use(this.middlewares.compression()); 

        this.server.use(this.middlewares.bodyParser.json());

        // enable the automatic request and response logs
        this.server.use(this.plugins.requestAndResponseLogger.write.bind(this.plugins.requestAndResponseLogger))

        // enable the limit of the quantity of requests per user in a time interval
        //if (this.config.throttle) this.server.use(this.baseServer.plugins.throttle(this.config.throttle)); //???????

        // enable the origin plugin
        if (this.origin) this.server.use(this.origin.proccess.bind(this.origin));

        this.configureCors();

        this.configureCache();

        this.configureSession();
    }

    // configure application routes
    configureRoutes() {
        this.route.importModuleRoutes();
        this.configureHealthCheck();
    }

    // configure health check route
    configureHealthCheck() {
        this.server.get(this.healthCheckUrl, (req, res, next) => {
            res.send(200, `${this.config.app.name} is running with ${this.config.app.env} environment on ${os.hostname()}`);
            return next();
        });
    }

    // configure Cross-Origin Resource Sharing (CORS) 
    // [https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Controle_Acesso_CORS] [https://www.npmjs.com/package/cors]
    configureCors() {
        if (this.config.cors) {
            this.log.debug('Cors has been configured');
            const cors = require('cors'); // eslint-disable-line
            this.server.use(cors(this.config.cors));
        }
    }

    // configure the error handle
    configureErrorHandler() {
        process.on('uncaughtException', (error) => {
            logger.debug('Uncaught Exception', 'An Uncaught Exception was throwed', {
                error
            });
            console.log(error);
        });

        this.server.use((err, req, res, next) => {
            const statusCode = err.statusCode || 500;
            const response = {
                "code": err.code,
                "message": err.message
            }
            res.status(statusCode).send(response);
        });

        this.server.on('restifyError', errorHandler.handle.bind(errorHandler));
    }

    // configure and connect to the database
    configureDatabase() {
        database.connect();
    }

    // configure and connect to the redis
    configureRedis() {
        redis.connect();
    }

    // configure and connect to the queue
    async configureQueue() {
        await queue.connect();
    }

    // configure and cache if the redis is enabled
    configureCache() {
        if (this.config.redis && this.config.cache && this.config.cache.enabled) {
            this.server.use((req, res, next) => {
                req.cache = new Cache();
                return next();
            });

            this.log.debug('Cache has been configured');
        }
    }

    // configure session if the redis is enabled
    configureSession() {
        if (this.config.redis && this.config.session) {
            this.server.use(async (req, res, next) => {
                new Session(req)
                    .load()
                    .then(() => {
                        return next();
                    })
                    .catch((error) => {
                        this.log.error('Unespected error on session load', error);
                        return next('Unespected error on session load');
                    });
            });
            this.log.debug('Session has been configured');
        }
    }

    // start web-server listen
    listen(port, listenCallBack, afterListenCallback) {
        const _port = this.config.app.port || port;

        const callback = () => {
            this.log.debug(`The sandbox is running as [${config.app.env}] [http://localhost:${_port}${this.healthCheckUrl}]`);
            this.configureDatabase();
            this.configureRedis();
            this.configureQueue();
            this.configureRoutes(); // ATTENTION: configureRoutes have to be after configureDatabase
            this.configureErrorHandler();
            this.configureWebServer();
            if (afterListenCallback) afterListenCallback();
        };

       
        this.listener = this.server.listen(_port, listenCallBack || callback);
    }
}

module.exports = Server;
