// build instance in runtime
module.exports = {
    build: (controllerClass, method) => {
        return (req, res, next) => {
            const controller = new controllerClass();
            return controller[method](req, res, next);
        }   
    }
};