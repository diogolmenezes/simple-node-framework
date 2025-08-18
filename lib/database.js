/* eslint-disable global-require */
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
        this._totalConnections = 0;
        this._connectedConnections = 0;

        if (this.config.db) {
            if (this.config.db.mongodb) {
                this.mongoose = require('mongoose');
                this.mongoose.Promise = Promise;
            }

            if (this.config.db.oracle) {
                this.oracledb = require('oracledb');
                this.oracledb.Promise = Promise;
            }

            if (this.config.db.sqlserver) {
                this.mssql = require('mssql');
                this.mssql.Promise = Promise;
            }
        }
    }

    isReady() {
        if(this._totalConnections === 0) return true;
        return this._connectedConnections === this._totalConnections
    }

    // close all database connections
    async close(name) {
        if (!this.config.db) return;

        // map all databases
        Object.keys(this.connections).map((database) => {
            // map all connections
            Object.keys(this.connections[database]).map((connection) => {
                if (!name) {
                    // Get the pool from the pool cache and close it when no
                    // connections are in use, or force it closed after 5 seconds
                    // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file
                    // https://github.com/oracle/node-oracledb/issues/688#issuecomment-497345542
                    // https://oracle.github.io/node-oracledb/doc/api.html#-621-poolclose

                    this.connections[database][connection].close(5)
                        .then(() => {
                            this.log.debug(`Disconected from ${database} database [${connection}]`);
                            delete this.connections[connection];
                            this._connectedConnections -= 1;
                        });
                }
            });
        });
    }

    // connect to all defined databases
    async connect() {
        if (!this.config.db) return;

        // map all databses ( oracle, mongo, etc...)
        Object.keys(this.config.db).map(database => {
            this.connections[database] = {}; // iniciando o nó que vai guardar a conexão

            // map all applications inside database node
            Object.keys(this.config.db[database]).map((application) => {
                // we will not connect 2 times at the same database :)
                if (this.connections[database] && this.connections[database][application]) return;

                const configurationNode = this.config.db[database][application];

                switch (database.toLowerCase()) {
                    case 'oracle':
                        this._totalConnections += 1;
                        this.connectOnOracle(configurationNode, application);
                        break;
                    case 'mongodb':
                    case 'mongo':
                        this._totalConnections += 1;
                        this.connectOnMongo(configurationNode, application);
                        break;
                    case 'sqlserver':
                        this._totalConnections += 1;
                        this.connectOnSqlServer(configurationNode, application);
                        break;
                    default:
                        this.log.debug(`ATTENTION: [${database}] its not supported`);
                        break;
                }
            });
        });
    }

    // create sqlserver pool
    async connectOnSqlServer(connectionConfig, connectionName) {
        const pool = await new this.mssql.ConnectionPool({ ...connectionConfig }).connect();
        this.connections.sqlserver[connectionName] = pool;
        this.log.debug(`Connected at sqlserver database [${connectionName}] [${connectionConfig.server}/${connectionConfig.database}]`);
        if (this.onSqlServerConnected) this.onSqlServerConnected();
        this._connectedConnections += 1;
    }

    // create oracle pool
    async connectOnOracle(connectionConfig, connectionName) {
        const pool = await this.oracledb.createPool({ ...connectionConfig, poolAlias: `oracle.${connectionName}` });
        this.connections.oracle[connectionName] = pool;
        this.log.debug(`Connected at oracle database [${connectionName}] [${connectionConfig.connectString}] pool [${connectionConfig.poolMax}]`);
        if (this.onOracleConnected) this.onOracleConnected();
        this._connectedConnections += 1;
    }

    // create mongo pool
    async connectOnMongo(connectionConfig, connectionName) {
        const connection = this.mongoose.createConnection(connectionConfig.url, connectionConfig.options);

        connection.on('connected', () => {
            this.log.debug(`Connected at mongodb database [${connectionName}] [${connectionConfig.url}]`);
            if (this.onMongoConnected) this.onMongoConnected();
            this._connectedConnections += 1;
        });

        connection.on('disconnected', () => {
            this.log.debug(`Disconnected from mongodb database [${connectionName}] [${connectionConfig.url}]`);
            this._connectedConnections -= 1;
        });

        connection.on('error', (erro) => {
            this.log.error(`Mongodb database connection error [${connectionName}] [${connectionConfig.url}]`, erro);
        });

        connection.on('reconnected', () => {
            this.log.debug(`Reconnected at mongodb database [${connectionName}] [${connectionConfig.url}]`);
        });

        this.connections.mongodb = this.connections.mongodb || {}

        this.connections.mongodb[connectionName] = connection;
    }
}

module.exports = {
    class: Database,
    instance: new Database()
};
