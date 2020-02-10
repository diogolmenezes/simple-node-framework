const Loggable = require('./base/loggable');
const config = require('./config');
const database = require('./database').instance;

// this class abstracts the audition concept
class Auditor extends Loggable {
    constructor() {
        super({
            module: 'SNF Auditor'
        });

        this.config = config;
        this.databaseConnectionEstablished = false;
    }

    // to audit an feature that you have on the project.
    async audit(actor, origin, action, label, object, description, metadata) {
        if (this.config.audit && this.config.audit.enabled) {
            if (database.connections.mongodb && !this.databaseConnectionEstablished) {
                this.configureAuditor(database.connections.mongodb.application);
            }

            this.auditModel.create({ actor, origin, action, label, object, description, metadata });
            this.log.debug(`Audit [${actor}] [${origin}] [${action}] created.`);
        } else {
            throw new Error('Auditor is not enabled. Please add to config.');
        }
    }

    configureAuditor(connection) {
        if (this.config.audit && this.config.audit.enabled) {
            if (this.config.db && this.config.db.mongodb) {
                this.auditModel = connection.model('Audit', new database.mongoose.Schema({
                    actor: String,
                    origin: String,
                    action: String,
                    label: String,
                    object: String,
                    description: String,
                    metadata: Object,
                    created_at: { type: Date, default: Date.now },
                }, {
                    autoCreate: true,
                    collection: 'audit'
                }));

                this.databaseConnectionEstablished = true;
            }
        }
    }
}

module.exports = {
    class: Auditor,
    instance: new Auditor()
};
