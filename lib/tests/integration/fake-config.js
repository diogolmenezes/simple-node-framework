module.exports = {
    log: {
        debug: false,
        bunyan: {
            name: 'test:integration',
            streams: [
                {
                    level: 'fatal',
                    stream: 'process.stdout',
                },
            ]
        }
    }
}