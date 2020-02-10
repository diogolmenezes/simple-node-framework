<<<<<<< Updated upstream
=======
const Auditor = require('./lib/auditor');
>>>>>>> Stashed changes
const Authorization = require('./lib/authorization');
const BaseClass = require('./lib/base/base');
const BaseController = require('./lib/base/base-controller');
const BaseRepository = require('./lib/base/base-repository');
const BaseRest = require('./lib/base/base-rest');
const BaseService = require('./lib/base/base-service');
const BaseSoap = require('./lib/base/base-soap');
const Cache = require('./lib/cache');
const config = require('./lib/config');
const ControllerFactory = require('./lib/util/controller-factory');
const Database = require('./lib/database');
const ErrorHandler = require('./lib/error');
const Helper = require('./lib/util/helpers');
const Log = require('./lib/log');
const Loggable = require('./lib/base/loggable');
const ProcessTimer = require('./lib/util/process-timer');
const Redis = require('./lib/redis');
const Queue = require('./lib/queue');
const Route = require('./lib/route');
const Server = require('./lib/server');
const Session = require('./lib/session');
const ssl = require('./lib/ssl');
const TestHelper = require('./lib/test');

module.exports = {
    Auditor: Auditor.class,
    Authorization: Authorization.class,
    Base: {
        BaseClass,
        BaseController,
        BaseRepository,
        BaseRest,
        BaseService,
        BaseSoap
    },
    Cache,
    ControllerFactory,
    Database: Database.class,
    ErrorHandler: ErrorHandler.class,
    Helper,
    Log: Log.class,
    Loggable,
    ProcessTimer,
    Route: Route.class,
    Server,
    Session,
    Singleton: {
        auditor: Auditor.instance,
        authorization: Authorization.instance,
        config,
        database: Database.instance,
        errorHandler: ErrorHandler.instance,
        log: Log.instance,
        redis: Redis.instance,
        queue: Queue.instance,
        route: Route.instance,
        ssl
    },
    TestHelper
};
