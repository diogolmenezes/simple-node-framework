const Loggable = require('./base/loggable');
const config = require('./config');

// this class abstract the database concept
// its possible connect with more than one databases ate the same time
class Database extends Loggable {
    constructor() {
        super({
            module: 'SNF Database'
        });

        this.config = config;
        this.connections = {};

        if (this.config.db) {
            this.mongoose = require('mongoose'); // eslint-disable-line global-require
            this.mongoose.Promise = Promise;
        }
    }

    // close all database connections
    close(name) {
        if (!this.config.db) return;

        Object.keys(this.connections).map((connection) => {
            if (!name || connection.toLowerCase() === name.toLowerCase()) {
                this.connections[connection].close();
                delete this.connections[connection];
            }
        });
    }

    // connect to all defined databases
    connect() {
        if (!this.config.db) return;

        Object.keys(this.config.db).map((property) => {
            // we will not connect 2 times at the same database :)
            if (this.connections[property]) return;

            const connectionConfig = this.config.db[property];

            const connection = this.mongoose.createConnection(connectionConfig.url, connectionConfig.options);

            connection.on('connected', () => {
                this.log.debug(`Connected at database [${property}] [${connectionConfig.url}]`);
                this.connections[property] = connection;
            });

            connection.on('close', () => {
                this.log.debug(`Disconected from database [${property}] [${connectionConfig.url}]`);
            });

            connection.on('error', (erro) => {
                this.log.error(`Database connection error [${property}] [${connectionConfig.url}]`, erro);
            });
        });
    }
}

module.exports = new Database();
