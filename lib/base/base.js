const Loggable = require('./loggable');
const ProcessTimer = require('../util/process-timer');
const Auditor = require('../auditor').instance;

// this class adds log and timer feature to classes
class Base extends Loggable {
    constructor({ module }) {
        super({
            module
        });

        this.timer = new ProcessTimer();
        this.auditor = Auditor;
    }
}

module.exports = Base;
