const authorization = require('./lib/authorization');
const config = require('./lib/config');
const applicationError = require('./lib/errors');
const logger = require('./lib/log');
const redis = require('./lib/redis');
const session = require('./lib/session');
const SessionHandler = require('./lib/util/session-handler');
const route = require('./lib/route');
const Server = require('./lib/server');
const Cache = require('./lib/cache');
const database = require('./lib/database');
const TestHelper = require('./lib/test');
const Loggable = require('./lib/base/loggable');
const BaseClass = require('./lib/base/base');
const BaseController = require('./lib/base/base-controller');
const BaseService = require('./lib/base/base-service');
const BaseRepository = require('./lib/base/base-repository');
const BaseRest = require('./lib/base/base-rest');
const BaseSoap = require('./lib/base/base-soap');
const Helper = require('./lib/util/helpers');
const ProcessTimer = require('./lib/util/process-timer');
const ControllerFactory = require('./lib/util/controller-factory');

module.exports = {
    Base: {
        BaseClass,
        BaseController,
        BaseRepository,
        BaseRest,
        BaseService,
        BaseSoap
    },
    ControllerFactory,
    database,
    Helper,
    Loggable,
    ProcessTimer,
    Server,
    SessionHandler,
    TestHelper,
    applicationError,
    authorization,
    Cache,
    config,
    logger,
    redis,
    restifyErrors: applicationError.restifyErrors,
    route,
    session
};
