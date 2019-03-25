const { Server } = require('simple-node-framework');

// To start default server do this:
module.exports = new Server().configure({ port: 8081 });

// To send a custom listenCallback or port do this:
// const server = new Server();
// module.exports = server.configure({
//     port: 8081,
//     listenCallBack: () => { server.log.debug('Hey, i am a custom callback on [8081]') }
// });

// To use a custom server do this:
// module.exports = require('./api/config/custom-server');
