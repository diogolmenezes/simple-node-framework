const Loggable = require('./loggable');
const ProcessTimer = require('../util/process-timer');

class Base extends Loggable {
    constructor({ module }) {
        super({
            module
        });

        this.timer  = new ProcessTimer();
    }
}

module.exports = Base;