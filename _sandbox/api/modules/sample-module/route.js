const server = require('../../../index.js');
const { route, redis } = require('simple-node-framework');
const { info }  = route.info(__filename);

server.get('/teste', (req, res, next) => {
    res.send('Olaaa');
    redis.set('MINHA', 'VALOR');
    redis.delPattern('*')
    return next();
});