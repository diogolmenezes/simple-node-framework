module.exports = {
    "app": {
        "name": "my-application",
        "baseRoute": "/api",
        "port": 8094
    },
    "cors": {
        "origin": '*',
        "allowedHeaders": [
            "Content-type",
            "Authorization",
            "Cache-Control",
            "x-origin-channel",
            "x-origin-application",
            "x-origin-device"
        ]
    },
    // "db": {
    //     "mongodb": {
    //         "application": {
    //             "url": "mongodb://localhost:27017/my-application",
    //             "options": {
    //                 "useNewUrlParser": true,
    //                 "poolSize": 10
    //             }
    //         }
    //     }
    // },
    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "cache": {
        "enabled": true,
        "ttl": 3600,
        "headerKey": "x-identifier"
    },
    "session": {
        "prefix": "myapplication",
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
        "enabled": true,
        "basic": {
            "users": [
                { 
                    "username": "admin",
                    "password": "admin"
                }
            ]
        },
        "jwt": {
            "secret": "49b4e2f9-ec31-4758-bae5-741a80e0e8de",
            "expiresIn": "1h"
        }
    },
    "audit": {
        "enabled": false
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
    },
    "integrations": 
    {
        "rest": {
            "sampleRest": {
                "timeout": 3,
                "endpoint": "http://dummy.restapiexample.com/api/v1/employees"
            },
            "sampleRest2": {
                "timeout": 3,
                "endpoint": "http://..."
            }
        },
        "soap": {
            "servico1": {
                "timeout": 5,
                "wsdl": "http://...?wsdl",
                "endpoint": "http://..."
            }
        }
    }
}