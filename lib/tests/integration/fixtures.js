const database = {
    db: {
        mongodb: {
            application: {
                url: 'mongodb://localhost:27017/'
            }
        }
    }
}

const redis = {
    redis: {
        host: 'redis-digital-prod.7u6xhq.ng.0001.sae1.cache.amazonaws.com',
        port: 6379
    }
}

module.exports = {
    database,
    redis
}