const Session = require('./util/session-handler');

module.exports = {
    start: (config) => {
        return (req, res, next) => {
            const session = new Session(config);
            session.start(req, res, next);
            req.session = session;
        };
    },
    Session
};
