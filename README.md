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
-   [Util](#util)
-   [Erros](#erros)
-   [Test](#test)

## Quick Start

The best way to get started with SNF is using [create-snf-app](https://github.com/diogolmenezes/create-snf-app)

```shell
npx create-snf-app my-app --disable-database --disable-redis -p 8091
cd my-app
npm start
```

## Configuration

If you are using [create-snf-app](https://github.com/diogolmenezes/create-snf-app) all SNF configuration is located at api/config/env.

There are _1 file per environment (default, testing, staging, production)_, so its possible to execute the application using an defined environment.

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

The logs will be saved at _logs folder_ at root of the application.

If you turn of _debug_ SNF will not output logs at your console, by default we turn of debug logs in production environment.

SNF uses bunyan to write great logs, so we have a node to configure bunyan too.

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

SNF log will automaticaly attach your request-id in the log if you call _super.activateRequestLog(req)_ in the first line of your controller method.

```json
{ "name": "Application", "host": "agility", "hostname": "agility", "pid": 11155, "level": 20, "pretty": "{\"obj\": {\"_obj\": undefined, \"request_id\": \"1a2dd75cd83847429c0985fa5ed337f4\"}}", "msg": "Customer Repository =>  Loading customer [diogo]", "time": "2019-03-27T19:15:17.354Z", "v": 0 }
```

### Hostname in the log

SNF attach your /etc/hostname in the log, this way you can discover witch machine is writing the logs

```json
{ "name": "Application", "host": "agility", "hostname": "agility", "pid": 11155, "level": 20, "pretty": "{\"obj\": {\"_obj\": undefined, \"request_id\": \"1a2dd75cd83847429c0985fa5ed337f4\"}}", "msg": "Customer Repository =>  Loading customer [diogo]", "time": "2019-03-27T19:15:17.354Z", "v": 0 }
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

SNF support multiple connections in Mongo Databases.

You can disable database handler by removing the "db" node at configuration file, or just runing [create-snf-app](https://github.com/diogolmenezes/create-snf-app) using the --disable-database option.

```json
    "db": {
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
```

> By the way, we use mongoose client and the options node is mongoose options

If you want to do this you can use the secong connection like _database.connections.second_.

```javascript
const { database } = require('simple-node-framework');
const connection = database.connections.second;

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

## Redis

SNF support has a redis handler to simplify connection and use.

You can disable redis handler by removing the "redis" node at configuration file, or just runing [create-snf-app](https://github.com/diogolmenezes/create-snf-app) using the --disable-redis option.

> By the way, we use io-redis as redis client.

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
const { redis } = require('simple-node-framework');

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
const { route, ControllerFactory, Cache } = require('simple-node-framework');
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
        if(req.params.user = 'some-user' && req.params.password === 'some-pass') {
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
        req.session.load('some-user-identifier')
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
        if(req.params.user = 'some-user' && req.params.password === 'some-pass') {
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

## Server

## Route

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
````

### Request and Response Plugin

This plugin will automaticaly log all requests and responses. It will enabled by default and the only way to disable it is overriding the _configureMiddlewares_ method at SNF _Server_ Class.

## Config

## Request Scope

## Util

## Errors

## Test
