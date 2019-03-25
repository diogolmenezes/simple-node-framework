// build instance in runtime
module.exports = {
    build: (ControllerClass, method) => {
        return (req, res, next) => {
            const controller = new ControllerClass();
            return controller[method](req, res, next);
        };
    }
};
