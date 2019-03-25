const config = require('./config');
const database = require('./database');
const redis = require('./redis');

// this class provide ways to improve test process
class TestHelper {
    static before({ consoleLogs = false } = {}) {
        // by default we turn off console logs on tests
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
