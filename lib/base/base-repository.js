const Base = require('./base');

class BaseRepository extends Base {
    constructor({ module }) {
        super({
            module
        });
    }
}

module.exports = BaseRepository;
