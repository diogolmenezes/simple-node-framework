const Loggable = require('./base/loggable');
const config = require('./config');

// this class abstract the queue concept
class Queue extends Loggable {
    constructor() {
        super({
            module: 'SNF Queue'
        });

        this.config = config.queue || {};
        this.connection = null;
        this.channel = null;
        this.connected = false;
    }

    // connect to the queue amqp instance
    async connect() {
        if (config.queue) {
            if (this.connected) return this;

            const amqplib = require('amqplib'); // eslint-disable-line            

            this.connection = await amqplib.connect(`amqp://${this.config.host}`);
            this.channel = await this.connection.createChannel();

            this.log.debug(`Connected at the queue [${this.config.host}]`);
            this.connected = true;

            this.connection.on('close', () => {
                this.log.debug(`Disconected from the queue [${this.config.host}]`);
                this.connected = false;
            });

            return this;
        }

        return null;
    }

    // close queue connection
    close() {
        if (this.connection) this.connection.close();
    }
}

module.exports = {
    class: Queue,
    instance: new Queue()
};
