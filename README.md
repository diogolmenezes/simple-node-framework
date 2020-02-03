# Simple node framework (SNF)

SNF is a simple node-js framework that provides simple ways to use log, cache, database, session, redis, request scope and more.

-   [Quick Start](#quick-start)
-   [Configuration](#configuration)
-   [Base Classes](#base-classes)
-   [Log](#log)
-   [Database](#database)
-   [Redis](#redis)
-   [Cache](#cache)
-   [Session](#session)
-   [Authorization](#authorization)
-   [Server](#server)
-   [Route](#route)
-   [Plugins](#plugins)
-   [Config](#config)
-   [Request Scope](#request-scope)
-   [Audit](#audit)
-   [Util](#util)
-   [Erros](#erros)
-   [Test](#test)

## Quick Start

The best way to get started with SNF is using [create-snf-app](https://github.com/diogolmenezes/create-snf-app)

```shell
npx create-snf-app my-app -p 8091
cd my-app
npm start
```

With database and redis enabled:

```shell
npx create-snf-app my-app --enable-database --enable-redis -p 8091
cd my-app
npm start
```

## Configuration

If you are using [create-snf-app](https://github.com/diogolmenezes/create-snf-app) all SNF configuration is located at api/config/env.

There are *1 file per environment (default, testing, staging, production)*, so its possible to execute the application using an defined environment.

`NODE_ENV=production node index`

## Base Classes

Base classes are the most used strategy in SNF. Your class can inherit the base class and have your features and log prefixes.

[create-snf-app](https://github.com/diogolmenezes/create-snf-app) has many examples of base class use.

| Base Class     | Description                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Base           | Log and timer features, the this.log and this.timer objects will be ready to use                                               |
| BaseController | Log and timer features, the this.log and this.timer objects will be ready to use                                               |
| BaseService    | Log and timer features, the this.log and this.timer objects will be ready to use                                               |
| BaseRepository | Log and timer features, the this.log and this.timer objects will be ready to use                                               |
| BaseRest       | Rest features. this.fetch (node-fetch), this.responseHandler, this.log and this.timer objects will be ready to use             |
| BaseSoap       | Soap features. this.fetch (node-fetch), this.soap (soap), this.xml_parser this.log and this.timer objects will be ready to use |
| Loggable       | Log features, the this.log object will be ready to use                                                                         |

```javascript
const { BaseController } = require('simple-node-framework').Base;
const CustomerService = require('./service/customer-service');

// sample controller
class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller' // the module name will prefix all your logs
        });
    }

    async load(req, res, next) {
        super.activateRequestLog(req);
        this.log.debug('This is only a sample');
        req.send(200);
        return next();
    }
}

module.exports = Controller;
```

## Log

SNF has an smart log feature that will be turned on by default.

### Log Configuration

The logs will be saved at *logs folder* at root of the application.

If you turn of *debug* SNF will not output logs at your console, by default we turn of debug logs in production environment.

> SNF uses [bunyan](https://www.npmjs.com/package/bunyan) to write great logs, so we have a node to configure bunyan too.

```json
"log": {
    "debug": true,
    "bunyan": {
        "name": "Application",
        "streams": [
            {
                "level": "debug",
                "type": "rotating-file",
                "path": "logs/{hostname}.log",
                "period": "1d",
                "count": 2
            }
        ]
    }
}
```

### Log on stdout

If you need to output bunyan logs to process.stdout, do this configuration

```json
"log": {
    "debug": false,
    "bunyan": {
        "name": "Application",
        "streams": [
            {
                "level": "debug",
                "stream": "process.stdout"
            }
        ]
    }
}
```

### Log methods

```javascript
this.log.info('Sample info log');
this.log.debug('Sample debug log', { people, status: 'active' });
this.log.warg('Sample warn log');
this.log.error('Sample error log', error);
this.log.fatal('Sample fatal log', error);
```

### Prefixed logs

All the logs will be automaticaly prefixed with module name, so if you write a log at controller class it will be prefixed with "Controller Name =>". This way you can view your application flow.

```shell
DEBUG My Sample Controller =>  Loading customer [diogo]
DEBUG Customer Service =>  Loading customer [diogo]
DEBUG Customer Repository =>  Loading customer [diogo]
```

### Request id in the log

SNF log will automaticaly attach your request-id in the log if you call *super.activateRequestLog(req)* in the first line of your controller method.

```json
{ "name": "Application", "host": "agility", "hostname": "agility", "pid": 11155, "level": 20, "pretty": "{\"obj\": {\"_obj\": undefined, \"request_id\": \"1a2dd75cd83847429c0985fa5ed337f4\"}}", "msg": "Customer Repository =>  Loading customer [diogo]", "time": "2019-03-27T19:15:17.354Z", "v": 0 }
```

### Hostname in the log

SNF attach your /etc/hostname in the log, this way you can discover witch machine is writing the logs

```json
{ "name": "Application", "host": "agility", "hostname": "agility", "pid": 11155, "level": 20, "pretty": "{\"obj\": {\"_obj\": undefined, \"request_id\": \"1a2dd75cd83847429c0985fa5ed337f4\"}}", "msg": "Customer Repository =>  Loading customer [diogo]", "time": "2019-03-27T19:15:17.354Z", "v": 0 }
```

### Ignore request and response logs in some routes

To ignore some route on request/response logs plugin, just add ignore attribute on configuration file.

```json
"log": {
    "debug": false,
    "bunyan": {
        "name": "Application",
        "streams": [
            {
                "level": "debug",
                "stream": "process.stdout"
            }
        ]
    },
    "requestResponse": {
        "ignore": ["/"]
    }
}
```





### Logs with objects

Its possible to write logs with an JSON object. SNF will stringfy and prettfy your object before write.

```javascript
const people = { name: 'Jhon', age: 35 };
this.log.debug('This is only a log', people);
```

```shell
{"name":"Application","host":"agility","hostname":"agility","pid":11627,"level":20,"pretty":"{\"obj\": {\"age\": 35, \"name\": \"Jhon\"}}","msg":"My Sample Controller =>  This is only a log","time":"2019-03-27T19:23:34.229Z","v":0}
```

If you want to log an object in json format, just sent inside a "natural" property this way the object will not be stringfied.

```javascript
const people = { name: 'Jhon', age: 35 };
this.log.debug('This is only a log', { natural: people });
```

```shell
{"name":"Application","host":"agility","hostname":"agility","pid":11765,"level":20,"natural":{"name":"Jhon","age":35},"msg":"My Sample Controller =>  This  is only a log","time":"2019-03-27T19:25:36.431Z","v":0}
```

If you need log one object as natural mode and another as string on the same call, just send "natural" and "pretty" properties:

```javascript
const people = { name: 'Jhon', age: 35 };
this.log.debug('This is only a log', { natural: people, pretty: people });
```

```shell
{"name":"Application","host":"agility","hostname":"agility","pid":12488,"level":20,"natural":{"name":"Jhon","age":35},"pretty":"{\"age\": 35, \"name\": \"Jhon\"}","msg":"My Sample Controller =>  This is only a log","time":"2019-03-27T19:35:01.323Z","v":0}
```

## Database

SNF support multiple connections at, mongo, oracle and sql server.

You can disable database handler by removing the "db" node at configuration file, or just runing [create-snf-app](https://github.com/diogolmenezes/create-snf-app) using the --disable-database option.

```json
    "db": {
        "mongodb": {
            "first": {
                "url": "mongodb://localhost:27017/my-database",
                "options": {
                    "useNewUrlParser": true,
                    "poolSize": 10
                }
            },
            "second": {
                "url": "mongodb://server1:27017,server2:27017,server3:27017,server4:27017/other-database?replicaSet=rs0",
                "options": {
                    "user": "some-user",
                    "pass": "some-password",
                    "useMongoClient": true,
                    "poolSize": 10,
                    "keepAlive": 300000,
                    "connectTimeoutMS": 30000
                }
            }
        },
        "oracle": {
            "first": {
                "user": "some-user",
                "password": "some-password",
                "connectString": "host/service",
                "poolMin": 0,
                "poolMax": 5,
                "poolIncrement": 0
            }
        },
        "sqlserver": {
            "first": {
                "user": "some-user",
                "password": "some-password",
                "database": "database",
                "server": "host"
            }
        }
    }
```

### MongoDB

To enable mongodb just add mongodb configuration to config db node.

```json
    "db": {
        "mongodb": {
            "first": {
                "url": "mongodb://localhost:27017/my-database",
                "options": {
                    "useNewUrlParser": true,
                    "poolSize": 10
                }
            },
            "second": {
                "url": "mongodb://server1:27017,server2:27017,server3:27017,server4:27017/other-database?replicaSet=rs0",
                "options": {
                    "user": "some-user",
                    "pass": "some-password",
                    "useMongoClient": true,
                    "poolSize": 10,
                    "keepAlive": 300000,
                    "connectTimeoutMS": 30000
                }
            }
        }
    }
```

> By the way, we use [mongoose](https://www.npmjs.com/package/mongoose) client and the options node is mongoose options

You can use the secong connection like *database.connections.mongodb.second*.

```javascript
const { database } = require('simple-node-framework').Singleton;
const connection = database.connections.mongodb.second || mongoose;

// mongoose model configuration start
const schema = mongoose.Schema(
    {
        nome: String
    },
    {
        collection: 'customers'
    }
);

const model = connection.model('Customer', schema);
// mongoose model configuration end

this.model.findOne({ name });
```

### Sql Server

To enable sqlserver just add sqlserver configuration to config db node.

```json
    "db": {
        "sqlserver": {
            "first": {
                "user": "some-user",
                "password": "some-password",
                "database": "database",
                "server": "host"
            }
        }
    }
```

> By the way, we use [mssql](https://www.npmjs.com/package/mssql) client and the options node is mssql options

To use, just get the pool and do the queries.

Internally, each [ConnectionPool](https://www.npmjs.com/package/mssql#connections-1) instance is a separate pool of TDS connections. Once you create a new Request/Transaction/Prepared Statement, a new TDS connection is acquired from the pool and reserved for desired action. *Once the action is complete, connection is released back to the pool*.

For more use samples, please see [mssql documentation](https://www.npmjs.com/package/mssql)

```javascript
const { BaseService } = require('simple-node-framework').Base;
const { config, database } = require('simple-node-framework').Singleton;

class PeopleRepository extends BaseService {
    constructor() {
        super({
            module: 'People Repository'
        });

        this.config = config;
        this.database = database;
        this.pool = database.connections.sqlserver.application;
    }

    async get(id) {
        const sql = `SELECT * FROM PEOPLE WHERE ID = @id`;

        const result = await this.pool.request()
            .input('id', id)
            .query(sql);

        return result;
    }
}

module.exports = PeopleRepository;

```

### Oracle

To enable oracle add oracle configuration to config db node.

```json
    "db": {
        "oracle": {
            "first": {
                "user": "some-user",
                "password": "some-password",
                "connectString": "host/service",
                "poolMin": 0,
                "poolMax": 5,
                "poolIncrement": 0
            }
        },
    }
```

You you need the [Oracle Instant Client](https://www.oracle.com/technetwork/topics/intel-macsoft-096467.html).

*Download the client and extract at ~/lib. After, create ~/lib/network/admin/sqlnet.ora file with DISABLE_OOB=ON configuration.*

More informations about DISABLE_OOB at:

- [https://oracle.github.io/node-oracledb/doc/api.html#-621-poolclose](https://oracle.github.io/node-oracledb/doc/api.html#-621-poolclose)
- [https://github.com/oracle/node-oracledb/issues/688](https://github.com/oracle/node-oracledb/issues/688)
- [https://www.oracle.com/technetwork/database/features/instant-client/ic-faq-094177.html#A5028](https://www.oracle.com/technetwork/database/features/instant-client/ic-faq-094177.html#A5028)

> By the way, we use [oracledb](https://www.npmjs.com/package/oracledb) client and the options node is oracledb options

To use, just get the pool and do the queries. *Here you MUST close the connection after use*.

For more use samples, please see [oracledb documentation](https://oracle.github.io/node-oracledb/doc/api.html)

```javascript
const { BaseService } = require('simple-node-framework').Base;
const { config, database } = require('simple-node-framework').Singleton;

class PeopleRepository extends BaseService {
    constructor() {
        super({
            module: 'People Repository'
        });

        this.config = config;
        this.database = database;
        this.pool = database.connections.oracle.application;
    }

    async get(id) {
        const connection = await this.pool.getConnection();

        try {
            const sql = `SELECT * FROM PEOPLE WHERE ID = :id`;
            const result = await connection.execute(sql, [id], { outFormat: this.database.oracledb.OBJECT });
            return result;

        } finally {
            connection.close();
        }
    }
}

module.exports = PeopleRepository;

```

### OnDatabaseConnect

If you need execute an action after database has connected, you should use the OnDatabaseConnect event.

```javascript
// index.js
const { database } = require('simple-node-framework').Singleton;

database.onMongoConnected = () => {
    // your code...
}

database.onOracleConnected = () => {
   // your code... 
}

database.onSqlServerConnected = () => {
   // your code... 
}

```


## Redis

SNF support has a redis handler to simplify connection and use.

You can disable redis handler by removing the "redis" node at configuration file, or just runing [create-snf-app](https://github.com/diogolmenezes/create-snf-app) using the --disable-redis option.

> By the way, we use [io-redis](https://github.com/luin/ioredis) as redis client.

Basic configuration:

```json
    "redis": {
        "host": "localhost",
        "ttl": 86400,
        "port": 6379
    },
```

Advanced configuration:

```json
    "redis": {
        "ttl": 86400,
        "name": "some-name",
        "password": "some-password",
        "sentinels": [
            {
                "host": "server1",
                "port": 26380
            },
            {
                "host": "server2",
                "port": 26380
            }
        ],
        "preferredSlaves": [
            {
                "ip": "server1",
                "port": "6380",
                "flags": "master"
            },
            {
                "ip": "server2",
                "port": "6380",
                "flags": "slave"
            }
        ]
    }
```

Using:

```javascript
const { redis } = require('simple-node-framework').Singleton;

// save user age in redis
const ttl = 300000; // 300000 miliseconds = 5 minutes
await redis.set('some-application:some-user:age', 34, 300000);

// get user age from redis
const age = await redis.get('some-application:some-user:age');

// remove user age from redis
redis.del('some-application:some-user:age');

// remove all application keys from redis
redis.delPattern('some-application:*');
```

## Cache

SNF has a cache handler that uses redis to save responses on the cache.

> By the way, you need active redis configuration to use this feature

The cache handler idea is to automaticaly retreive response cache if exists.

```json
    "cache": {
        "enabled": true,
        "ttl": 3600
    }
```

When the cache feature is active (by default), SNF inject the req.cache object.

So, when you have a sucess at you controller logic save the response on cache like this:

```javascript
const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        const message = 'Sample controller test';
        res.send(200, message);
        // save response in the cache
        const ttl = 300000;
        req.cache.saveResponse(200, message, res.headers, req, ttl);
        return next();
    }
}

module.exports = Controller;
```

After this the cache handler will save in your redis the key:

`simple-node-framework:cache:my-application:get:api/sample-module`

To automaticaly retreive your information, you need to configure the Cache.loadResponse middleware, so your controller will start get the information from the cache:

```javascript
const { ControllerFactory, Cache } = require('simple-node-framework');
const { route } = require('simple-node-framework').Singleton;
const server = require('../../../index.js');
const Controller = require('./controller');

const { full } = route.info(__filename);

// sample of cached route
server.get(`${full}/`, [Cache.loadResponse], ControllerFactory.build(Controller, 'get'));
```

If you set a headerKey at configuration, the cache handler will look for the defined key at the request header and use this key to compose the cache key.
This way, you can have unique user caches.

```json
    "cache": {
        "enabled": true,
        "ttl": 1800,
        "headerKey": "x-identifier"
    }
```

`simple-node-framework:user-identifier:cache:my-application:get:api/sample-module`

## Session

SNF has a session handler that uses redis to save application session.

> By the way, you need active redis configuration to use this feature

The session handler idea is to automaticaly retreive the session and append at req.session.

```json
    "session": {
        "prefix": "myapplication",
        "ttl": 3600
    },
```

When turned on, you can manipulate session data:

```javascript
const { BaseController } = require('simple-node-framework').Base;

class AccountController extends BaseController {
    constructor() {
        super({
            module: 'My Sample Account Controller'
        });
    }

    login(req, res, next) {
        if ((req.params.user === 'some-user' && req.params.password === 'some-pass')) {
            // create the session
            req.session.data.name = 'Diogo';
            req.session.create('some-user-identifier');
            res.send(200, 'Sample session controller test');
        }

        res.send(401);
        return next();
    }

    logout(req, res, next) {
        // destroy the session
        req.session.destroy();
        res.send(200, 'Sample session controller test');
        return next();
    }
}
```

And the session will be created:

`myapplication-session:some-user-identifier`

You can change an existing session:

```javascript
const { BaseController } = require('simple-node-framework').Base;

class UserController extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    changeName(req, res, next) {
        // update the session
        req.session.load('some-user-identifier');
        req.session.data.name = 'Diogo Menezes';
        req.session.update();
        res.send(200, 'Sample session controller test');
        return next();
    }
}
```

Like cache, if you set headerKey at configuration file, SNF will look for defined key at the header os request and automatic load the right session.

```json
    "session": {
        "prefix": "myapplication",
        "headerKey": "x-identifier",
        "ttl": 3600
    }
```

```javascript
const { BaseController } = require('simple-node-framework').Base;

class AccountController extends BaseController {
    constructor() {
        super({
            module: 'My Sample Account Controller'
        });
    }

    login(req, res, next) {
        if ((req.params.user === 'some-user' && req.params.password === 'some-pass')) {
            // create the session
            req.session.data.name = 'Diogo';
            // the session is automaticaly be created with "x-identifier" in the key
            req.session.create();
            res.send(200, 'Sample session controller test');
        }

        res.send(401);
        return next();
    }
}

class UserController extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    changeName(req, res, next) {
        // the session is automaticaly loaded  if you send "x-identifier" at the header
        req.session.data.name = 'Diogo Menezes';
        req.session.update();
        res.send(200, 'Sample session controller test');
        return next();
    }
}
```

## Authorization

SNF authorization handler protect your API with [Basic](https://tools.ietf.org/html/rfc7617#section-1) or [Bearer](https://tools.ietf.org/html/rfc6750#section-1) methods.

### Basic Authorization

"Basic" Hypertext Transfer Protocol (HTTP) authentication scheme, which transmits credentials as user-id/password pairs, encoded using Base64.

This scheme is not considered to be a secure method of user authentication unless used in conjunction with some external secure system such as TLS (Transport Layer Security, [RFC5246](https://tools.ietf.org/html/rfc5246)), as the user-id and password are passed over the network as cleartext.

```json
    "authorization": {
        "enabled": true,
        "basic": {
            "users":[
                {
                    "username": "admin",
                    "password": "admin"
                }
            ]
        }
    }
```

To protect your route with basic authorization you have to use the authorization middleware.

```javascript
const { ControllerFactory } = require('simple-node-framework');
const { route, authorization } = require('simple-node-framework').Singleton;
const server = require('../../../index.js');
const Controller = require('./controller');
const { full } = route.info(__filename);

server.get(`${full}/protected`, [authorization.protect.bind(authorization)], ControllerFactory.build(Controller, 'get'));
```

Your controller dont need to be changed, all the work is made by the middleware.

```javascript
const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        res.send(200, 'Sample controller test');
        return next();
    }
}

module.exports = Controller;
```

Now, when your API receive a request without an basic authorization header the middlware will return "401 Unauthorized".

If the API receive an invalid user and password will return "403 Forbidden".

If everything is ok the midleware will pass to the next() stef of the chain.

### Bearer Authorization

The Bearer authentication scheme is intended primarily for server authentication using the WWW-Authenticate and Authorization HTTP headers.

OAuth enables clients to access protected resources by obtaining an access token, which is defined as "a string representing an access authorization issued to the client", rather than using the resource owner's credentials directly.

Tokens are issued to clients by an authorization server with the approval of the resource owner. The client uses the access token to
access the protected resources hosted by the resource server. This OAuth access token is a bearer token.

TLS is mandatory to implement and use with this specification.

```json
    "authorization": {
        "enabled": true,
        "jwt": {
            "secret": "use-an-difficult-and-unique-secret-here",
            "expiresIn": "1h"
        }
    }
```

To protect your route with bearer authorization you have to use the authorization middleware.

```javascript
const { ControllerFactory } = require('simple-node-framework');
const { route, authorization } = require('simple-node-framework').Singleton;
const server = require('../../../index.js');
const Controller = require('./controller');
const { full } = route.info(__filename);

server.get(`${full}/protected`, [authorization.protect.bind(authorization)], ControllerFactory.build(Controller, 'get'));
```

Your controller dont need to be changed, all the work is made by the middleware.

```javascript
const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        res.send(200, 'Sample controller test');
        return next();
    }
}

module.exports = Controller;
```

Now, when your API receive a request without an baerer authorization header the middlware will return "401 Unauthorized".

If the API receive an invalid token will return "403 Forbidden".

If everything is ok the midleware will pass to the next() stef of the chain.

To generate a valid JWT token, you can use the createJWT helper method.

```javascript
const { BaseController } = require('simple-node-framework').Base;

class AccountController extends BaseController {
    constructor() {
        super({
            module: 'My Sample Account Controller'
        });
    }

    login(req, res, next) {
        const user = sample.GetUser(req.params.user, req.params.pass)

        if (user) {
            // create the JWT token to use as Bearer Token
            const token = authorization.createJWT({ name = user.name })
            res.send(200, token);
        }

        res.send(403);
        return next();
    }
}
```

Now you can send this JWT token at authorization header to all protected api calls of this user.

### Auth0 Authorization

The Auth0 authentication scheme is intended primarily for server authentication using Auth0 platform using [jwks validation](https://auth0.com/docs/jwks).

When you stand the Authorization header with the prefix Auth0 this middleware will validate your token.

```
Authorization: Auth0 eyJ0eXAiOiJKV1QiLCJhbGciOiJS...
```

```json
    "authorization": {
        "enabled": true,
        "auth0": {
            "domain": "https://YOUR_AUTH0_DOMAIN"
        }
    }
```

To protect your route with auth0 authorization you have to use the authorization middleware.

```javascript
const { ControllerFactory } = require('simple-node-framework');
const { route, authorization } = require('simple-node-framework').Singleton;
const server = require('../../../index.js');
const Controller = require('./controller');
const { full } = route.info(__filename);

server.get(`${full}/protected`, [authorization.protect.bind(authorization)], ControllerFactory.build(Controller, 'get'));
```

Your controller dont need to be changed, all the work is made by the middleware.

```javascript
const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        res.send(200, 'Sample controller test');
        return next();
    }
}

module.exports = Controller;
```
The middleware will check the auth0 token at https://${YOUR_DOMAIN}/.well-known/jwks.json 

When your API receive a request without an auth0 authorization header the middlware will return "401 Unauthorized".

If the API receive an invalid token will return "403 Forbidden".

If everything is ok the midleware will pass to the next() stef of the chain.

### Custom Authorization

Like almost everything in SNF framework, the authorization class can be overrided, so you can create your custom-authorization class and customize the authorization methods.

```javascript
const { Authorization } = require('simple-node-framework');

class CustomAuthorization extends Authorization {
    constructor() {
        super({
            module: 'Custom Authorization'
        });
    }

    // do the basic validation of credentials
    basicValidate(req, res, next) {
        const { username, password } = req.authorization.basic;

        if (sampleValidadeUserInTheDatabase(username, password)) {
            req.user = req.username;
            next();
        } else {
            next(this.applicationErrors.throw('Invalid username or password', 'ForbiddenError'));
        }
    }
}

module.exports = new CustomAuthorization();
```

## Server

The server class is the most important class in SNF because there we configure all other plugins, middlewares and helpers.

> By the way, we use [restify](https://www.npmjs.com/package/restify) as rest framework.

### Custom server

> ATENTION: Before create your custom server, plese take a look at base Server class https://github.com/diogolmenezes/simple-node-framework/blob/master/lib/server.js You have to be mutch careful if you want to override this class because some default behavors may stop work after this.

```javascript
const { Server } = require('simple-node-framework');

class CustomServer extends Server {
    constructor() {
        super({
            module: 'SNF Custom Server'
        });
    }

    // You can override server methods :)
    applyMiddlewares() {
        super.applyMiddlewares();
        this.log.debug('This is only a custom messagem from your custom server :)');
    }

    // You can override server methods :)
    applyAudit() {
        super.applyAudit();
        this.log.debug('This is only another custom messagem from your custom server :)');
    }

    // .. you can override all other methods ...
}

const customServer = new CustomServer();
const server = customServer.configure({
    afterListenCallBack: () => {
        customServer.log.debug('It works!');
    }
});

module.exports = {
    server,
    baseServer: customServer.baseServer
};
```

### Custom Server after listen callback

To run custom code after server listen, you have to send an afterListenCallBack

```javascript
const { Server } = require('simple-node-framework');

class CustomServer extends Server {
    constructor() {
        super({
            module: 'SNF Custom Server'
        });
    }
}

const customServer = new CustomServer();
const server = customServer.configure({
    afterListenCallBack: () => {
        customServer.log.debug('It works!');
    }
});

module.exports = {
    server,
    baseServer: customServer.baseServer
};
```

### Custom Server SSL HTTPS

To use HTTPS, send httpsOptions to configure method. 

```javascript
const { Server } = require('simple-node-framework');
const fs = require('fs');

class CustomServer extends Server {
    constructor() {
        super({
            module: 'SNF Custom Server'
        });
    }
}

const customServer = new CustomServer();
const server = customServer.configure({
    httpsOptions: {
        key: fs.readFileSync(__dirname + '/server.key'),
        certificate: fs.readFileSync(__dirname + '/server.crt')
    }
});

module.exports = {
    server,
    baseServer: customServer.baseServer
};
```
### Apply SSL certificate to solve UNABLE_TO_VERIFY_LEAF_SIGNATURE

If you need to send an CA to soap or fetch API calls, just create at application root path an _ssl folder.

Inside this folder create another folder with your cert name (my_company) ant put leaf.crt, inter.crt and root.crt files.

After this you need to call ssl.applyCerts on your index.js file. This method will import all your certfiles to global request agent.

```javascript
// index.js
const { ssl } = require('simple-node-framework').Singleton;
ssl.applyCerts();
```

To get the CRT files you needs to:

1 - Download the 3 ".cer" certificates on the website leaf, inter and root.
2 - Convert CER files in CRT files openssl x509 -inform der -in leaf.cer -out leaf.crt

## Route

The rote class is responsible for import all module routes and provide helper methods.

The info method return information about the route. By default SNF uses the app.baseRoute configuration as the base route of your api, so
a full route is the union of baseRoute + moduleName

```javascript
const { authorization, route } = require('simple-node-framework').Singleton;
const routeFile = __filename;

// ex: { baseRoute: '/api', module: 'customer', full: '/api/customer' }
const info = route.info(routeFile);
```    

## Plugins

SNF has some plugins to help you.

### Origin Plugin

The origin plugin will force that the api requesters sends some identification headers.

| Header               | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| x-origin-application | Witch application is calling the api Ex.: billing-application |
| x-origin-channel     | Witch chanhel is calling the api Ex.: web, mobile             |
| x-origin-device      | Witch device is calling the api Ex.: app-ios, app-android     |

You can turn if of in configuration.

```json
"origin": {
            "ignoreExact": [
                "/"
            ],
            "ignore": [
                "/doc/"
            ],
            "require": {
                "application": true,
                "channel": true,
                "device": false
            }
    }
```

### Request and Response Plugin

This plugin will automaticaly log all requests and responses. It will enabled by default and the only way to disable it is overriding the *configureMiddlewares* method at SNF *[Server](#server)* Class.

## Config

The configuration is responsible for importing the correct configuration file according to the environment (*NODE_ENV*).

All configuration files are located at *api/config/env* directory.

If you dont define an *NODE_ENV*, SNF will import the default env file.

```shell
$ NODE_ENV=staging node index

$ NODE_ENV=testing node index

$ NODE_ENV=production node index
```

## Request Scope

Request Scope is a feature that creates an scope to share information between objects.

All SNF base classes have the scope feature, because, one of best uses of scope is to share information on request lifecicle.

> By the way scope is a port os [ScopeJs](https://github.com/diogolmenezes/scope).

To get more scope examples go to [ScopeJs documentation](https://github.com/diogolmenezes/scope)

```javascript
const { BaseController } = require('simple-node-framework').Base;

// sample controller
class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller' // the module name will prefix all your logs
        });
        this.peopleService  = require('./people-service');
    }

    async get(req, res, next) {       
        // creating the scope and adding some information
        this.addScope({ name: 'diogo' });

        this.peopleService.doSomething();

        // you can get the scope that service class added
        console.log('UAU, now we have the Name and the Age information =>', JSON.stringify(this.scope));

        // this.scope
        // Object {_chain: Array(4), name: "diogo", age: 34}

        req.send(200);
        
        return next();
    }
}

module.exports = Controller;
```

```javascript
const { BaseController } = require('simple-node-framework').Base;

// sample controller
class PeopleService extends BaseService {
    constructor() {
        super({
            module: 'People Service' 
        });
    }

    doSomething() {                
        // assing more information to the scope
        this.addScope({ age: 34 });
    }
}

module.exports = new PeopleService();
```
## Audit

The audit module uses restify [audit logger](http://restify.com/docs/plugins-api/#auditlogger). To use, include this
configuration at your config file.

```json
    "audit": {
        "enabled": true,
        "printLog": true,
        "bunyan": {
            "name": "Audit",
            "streams": [
                {
                    "level": "debug",
                    "type": "rotating-file",
                    "path": "logs/audit.log",
                    "period": "1d",
                    "count": 2
                }
            ]
        }
    },
```

## Util

## Errors

## Test

SNF provides some test facilities especially if you are using SNF by an [create-snf-app](https://github.com/diogolmenezes/create-snf-app) application.
