# Simple node framework (SNF)

SNF is a simple node-js framework that provides simple ways to use log, cache, database, session, redis, request scope and more.

-   [Quick Start](#quick-start)
-   [Configuration](#configuration)
-   [Database](#database)
-   [Log](#log)

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

## Database

You can disable database handler by removing the "db" node at configuration file, or just runing [create-snf-app](https://github.com/diogolmenezes/create-snf-app) using the --disable-database option.

SNF support multiple connections in Mongo Databases, so you have to configure like this:

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

> By the way, the options node is mongoose options

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

- this.log.info
- this.log.debug
- this.log.warn
- this.log.error
- this.log.fatal

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