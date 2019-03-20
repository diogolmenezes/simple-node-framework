const Loggable = require('./base/loggable');
const config = require('./config');

// Classe responsável por gerenciar a conexão com o banco de dados (MongoDB)
class Database extends Loggable {
    constructor() {
        super({
            module: 'Database'
        });

        this.config = config;
        this.connections = {};
        this.mongoose = require('mongoose');
        this.mongoose.Promise = Promise;
    }

    close(name) {
        Object.keys(this.connections).map(connection => {
            if (!name || connection.toLowerCase() == name.toLowerCase()) {
                this.connections[connection].close();
                delete this.connections[connection];
            }
        });
    }

    connect() {
        if (this.config.db) {

            Object.keys(this.config.db).map(property => {
                
                // garante que nao conecta 2 vezes na mesma base
                if(this.connections[property])
                    return;

                const config = this.config.db[property];

                const connection = this.mongoose.createConnection(config.url, config.options);

                connection.on('connecting', () => {
                    this.log.debug(`Tentando conectar no banco de dados [${property}] [${config.url}]...`);
                });

                connection.on('connected', () => {
                    
                    this.log.debug(`Conectado com sucesso no banco de dados [${property}] [${config.url}]`);
                });

                connection.on('close', () => {
                    this.log.debug(`A conexão com o banco de dados foi fechada [${property}] [${config.url}]`);
                });

                connection.on('error', (erro) => {
                    this.log.error(`Erro ao conectar com banco de dados [${property}] [${config.url}]`, erro);
                });

                this.connections[property] = connection;
            });
        }
    }
}

module.exports = new Database();
