const { Server } = require('simple-node-framework');

class CustomServer extends Server {
    constructor() {
        super({
            module: 'Custom Server'
        });
    }

    // You can override server methods :)
    applyMiddlewares() {
        super.applyMiddlewares();
        this.log.debug('This is only a custom messagem from your custom server :)');
    }

    // You can override server methods :)
    applyAudit() {
        super.applyAudit();
        this.log.debug('This is only another custom messagem from your custom server :)');
    }
}
const customServer = new CustomServer();
const server = customServer.configure({
    afterListenCallBack: () => {
        customServer.log.debug('It works!');
    }
});

module.exports = {
    server,
    baseServer: customServer.baseServer
};