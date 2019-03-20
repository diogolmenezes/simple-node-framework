const restifyAudit = require('./lib/restify-audit');
const { authorization, Authorization } = require('./lib/authorization');
const config = require('./lib/config');
const configFramework = require('./config/config-framework');
const applicationError = require('./lib/errors');
const logger = require('./lib/log');
const redis = require('./lib/redis');
const session = require('./lib/session');
const SessionHandler = require('./lib/util/session-handler');
const route = require('./lib/route');
const Restify = require('./lib/restify');
const cache = require('./lib/cache');
const database = require('./lib/database');
const TestHelper = require('./lib/test');
const Loggable = require('./lib/base/loggable');
const RecaptchaMiddleware = require('./lib/middlewares/recaptchaMiddleware');
const Base = require('./lib/base/base');
const BaseController = require('./lib/base/base-controller');
const BaseService = require('./lib/base/base-service');
const BaseRepository = require('./lib/base/base-repository');
const BaseRest = require('./lib/base/base-rest');
const BaseSoap = require('./lib/base/base-soap');
const tokenizer = require('./lib/tokenizer');
const Helper = require('./lib/util/helpers');
const ProcessTimer = require('./lib/util/process-timer');
const ControllerFactory = require('./lib/controller-factory');

module.exports = {
    Authorization,
    Base,
    BaseController,
    BaseRepository,
    BaseRest,
    BaseService,
    BaseSoap,
    ControllerFactory,
    database,
    Helper,
    Loggable,
    RecaptchaMiddleware,
    ProcessTimer,
    Restify,
    SessionHandler,
    TestHelper,
    applicationError,
    authorization,
    cache,
    config,
    configFramework,
    logger,
    redis,
    restifyAudit,
    restifyErrors: applicationError.restifyErrors,
    route,
    session,
    tokenizer
};
