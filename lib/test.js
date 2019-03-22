const config = require('./config');
const database = require('./database');
const redis = require('./redis');

class TestHelper {
    static before({ consoleLogs = false } = {}) {
        config.log.debug = consoleLogs;
    }

    static after({ closeRedis = true, closeDatabase = true } = {}) {
        if (closeRedis && redis) {
            redis.close();
        }

        if (closeDatabase && database) {
            database.close();
        }
    }
}

module.exports = TestHelper;
