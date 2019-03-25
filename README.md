# Simple node framework (SNF)

SNF is a simple node-js framework that provides simple ways to use log, cache, database, session, redis, request scope and more.

- A
- B
- C

# Get started

## 1. SNF bootstrap

The best way to get started with SNF is using our bootstrap application.

`npx create-snf-app my-app`

## 2. Install NFS Manualy

The best way to get started with SNF is using our bootstrap application. But if you want, you can do this manualy.

`npm i simple-node-framework --save`

### 2.1 Basic file structure

This is the basic file scructure required by simple-node-framework. To install manualy you have to create this folder structure.

```shell
├── api
│   ├── config/
│   │   └── env/  (environment configuration files like staging.json, production.json)
│   │       ├── default.json
│   └── modules/ (here you can create your own application modules)
│       └── sample-module/
│           ├── controller.js
│           ├── route.js
├── logs/
├── index.js
├── package.json
```

### 2.2 Default configuration file example

This is the most complete example of configuration file. If you dont whant to use a feature just remove the equivalente configuration node at this file.

```json
/api/config/env/default.json

{
    "app": {
        "name": "my-application",
        "baseRoute": "/api",
        "port": 8094
    },
    "cors": {
        "preflightMaxAge": 5,
        "origins": [
            "*"
        ],
        "allowHeaders": [
            "x-origin-channel",
            "x-origin-application",
            "x-origin-device",
            "x-identifier"
        ],
        "exposeHeaders": []
    },
    "db": {
        "application": {
            "url": "mongodb://localhost:27017/my-application",
            "options": {
                "useNewUrlParser": true,
                "poolSize": 10
            }
        }
    },
    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "cache": {
        "enabled": true,
        "headerKey": "x-identifier"
    },
    "session": {
        "prefix": "my-application",
        "headerKey": "x-identifier",
        "ttl": 3600
    },
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
    },
    "authorization": {
        "enabled": false,
        "scheme": "Bearer",
        "jwt": {
            "secret": "put_your_own_secret_here",
            "expiresIn": "1h"
        }
    },
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
    "origin": {
        "ignoreExact": [
            "/"
        ],
        "ignore": [
            "/doc/"
        ],
        "require": {
            "application": false,
            "channel": false,
            "device": false
        }
    }
}
```

## 2.3 Controller

```javascript
// modules/sample-module/controller.js

const { BaseController } = require('simple-node-framework').Base;

class Controller extends BaseController {
    constructor() {
        super({
            module: 'My Sample Controller'
        });
    }

    get(req, res, next) {
        super.activateRequestLog(req);
        this.log.debug('This is a sample log');
        res.send(200, 'Sample controller test');
        return next();
    }
}

module.exports = Controller;
```

## 2.4 Route

```javascript
// modules/sample-module/route.js

const { route, ControllerFactory } = require('simple-node-framework');
const server = require('../../../index.js');
const Controller = require('./controller');

const { full } = route.info(__filename);

server.get(`${full}/`, ControllerFactory.build(Controller, 'get'));
```

## 2.5 Server

```javascript
// index.js

const { Server } = require('simple-node-framework');

module.exports = new Server().configure();
```
## 2.5 Starting the server

Before starting, make sure you have a redis and mongo server running and that their addresses are correct in the application configuration file. Otherwise you can disable redis and mongo by just removing the keys from the configuration file.

Now, start the aplication and test if is running http://localhost:8094/api/sample-module/.

`node index.js`

```shell
dmenezes@agility:~/projetos/sample-application$ node index.js

DEBUG SNF Server =>  Cache has been configured
DEBUG SNF Server =>  Session has been configured
DEBUG SNF Server =>  The sandbox is running as [default] [http://localhost:8094/]
DEBUG SNF Route =>  Importing [sample-module] routes from [api/modules/sample-module/route.js]
DEBUG SNF Redis =>  Connected at REDIS [localhost:6379]
DEBUG SNF Database =>  Connected at database [application] [mongodb://localhost:27017/my-application]
```
