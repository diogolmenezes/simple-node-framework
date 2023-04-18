const config = {
    db: {
        mongodb: {
            db1: {
                url: 'mongodb://localhost:27017/'
            }
        },
        oracle: {
            db2: {
                user: 'system',
                password: 'oracle',
                connectString: 'localhost'
            }
        },
        sqlserver: {
            db3: {
                password: 'root@RDSL',
                database: 'tempdb',
                user: 'sa',
                server: '127.0.0.1',
                trustServerCertificate: true
            }
        },
    },
    redis: {
        host: 'localhost',
        port: 6379
    }
}

module.exports = {
    config
}