const server = require('../../../index.js');
const Controller = require('./controller')
const { route, ControllerFactory, Cache, authorization } = require('simple-node-framework');
const { full }  = route.info(__filename);

// sample of cached route
server.get(`${full}/`, [ Cache.loadResponse ],ControllerFactory.build(Controller, 'get'));

// sample of protected route
server.get(`${full}/protected`, [
    authorization.protect.bind(authorization),
    Cache.loadResponse
],ControllerFactory.build(Controller, 'get'));