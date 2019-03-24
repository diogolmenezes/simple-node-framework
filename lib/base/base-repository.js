const Base = require('./base');

// this class adds base functionalities to repositories
class BaseRepository extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseRepository;
