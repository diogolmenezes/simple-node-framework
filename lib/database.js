/* eslint-disable global-require */
const Loggable = require('./base/loggable');
const config = require('./config');

// this class abstract the database concept
// its possible connect with more than one databases ate the same time
class Database extends Loggable {
    constructor(localConfig) {
        super({
            module: 'SNF Database'
        });

        this.config = localConfig ? localConfig : config;
        this.connections = {};

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

    isConnected() {
        return Object.keys(this.connections).length > 0;
    }

    // close all database connections
    close(name) {
        if (!this.config.db) return;

        const promises = [];

        // map all databases
        Object.keys(this.connections).forEach((database) => {
            // map all connections
            Object.keys(this.connections[database]).forEach((connection) => {
                if (!name) {
                    // Get the pool from the pool cache and close it when no
                    // connections are in use, or force it closed after 5 seconds
                    // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file
                    // https://github.com/oracle/node-oracledb/issues/688#issuecomment-497345542
                    // https://oracle.github.io/node-oracledb/doc/api.html#-621-poolclose

                    promises.push(
                        this.connections[database][connection].close(5).then(() => {
                            this.log.debug(`Disconected from ${database} database [${connection}]`);
                            delete this.connections[database][connection];
                            
                            if (Object.keys(this.connections[database]).length === 0) {
                                delete this.connections[database];
                            }
                        })
                    );
                }
            });
        });

        return Promise.all(promises);
    }

    // connect to all defined databases
    connect() {
        if (!this.config.db) return;

        const promises = [];

        // map all databases ( oracle, mongo, etc...)
        Object.keys(this.config.db).forEach(databaseTypeName => {
            const databaseType = databaseTypeName.toLowerCase();
            this.connections[databaseType] = {}; // iniciando o nó que vai guardar a conexão

            // map all applications inside database node
            Object.keys(this.config.db[databaseType]).forEach((databaseName) => {
                // we will not connect 2 times at the same database :)
                if (this.connections[databaseType] && this.connections[databaseType][databaseName]) return;

                const configurationNode = this.config.db[databaseType][databaseName];

                switch (databaseType) {
                    case 'oracle':
                        promises.push(this.connectOnOracle(configurationNode, databaseName));
                        break;
                    case 'mongodb':
                    case 'mongo':
                        promises.push(this.connectOnMongo(configurationNode, databaseName));
                        break;
                    case 'sqlserver':
                        promises.push(this.connectOnSqlServer(configurationNode, databaseName));
                        break;
                    default:
                        this.log.debug(`ATTENTION: [${databaseType}] its not supported`);
                        break;
                }
            });
        });

        return Promise.all(promises);
    }

    // create sqlserver pool
    async connectOnSqlServer(connectionConfig, connectionName) {
        const pool = await new this.mssql.ConnectionPool({ ...connectionConfig }).connect();
        this.connections.sqlserver[connectionName] = pool;
        this.log.debug(`Connected at sqlserver database [${connectionName}] [${connectionConfig.server}/${connectionConfig.database}]`);
        if (this.onSqlServerConnected) this.onSqlServerConnected();
        return pool;
    }

    // create oracle pool
    async connectOnOracle(connectionConfig, connectionName) {
        const pool = await this.oracledb.createPool({ ...connectionConfig, poolAlias: `oracle.${connectionName}` });
        this.connections.oracle[connectionName] = pool;
        this.log.debug(`Connected at oracle database [${connectionName}] [${connectionConfig.connectString}] pool [${connectionConfig.poolMax}]`);
        if (this.onOracleConnected) this.onOracleConnected();
        return pool;
    }

    // create mongo pool
    connectOnMongo(connectionConfig, connectionName) {
        return new Promise((resolve, reject) => {
            const connection = this.mongoose.createConnection(connectionConfig.url, connectionConfig.options);

            connection.on('connected', () => {
                this.log.debug(`Connected at mongodb database [${connectionName}] [${connectionConfig.url}]`);
                if (this.onMongoConnected) this.onMongoConnected();
                resolve(connection);
            });

            connection.on('error', (erro) => {
                this.log.error(`Mongodb database connection error [${connectionName}] [${connectionConfig.url}]`, erro);
                reject(erro);
            });

            connection.on('disconnected', () => {
                this.log.debug(`Disconnected from mongodb database [${connectionName}] [${connectionConfig.url}]`);
            });

            connection.on('reconnected', () => {
                this.log.debug(`Reconnected at mongodb database [${connectionName}] [${connectionConfig.url}]`);
            });

            this.connections.mongodb[connectionName] = connection;
        })
    }
}

module.exports = {
    class: Database,
    instance: new Database()
};
