// cria uma instancia de controller em tempo de execução
module.exports = {
    build: (controllerClass, method) => {
        return (req, res, next) => {
            const controller = new controllerClass();
            return controller[method](req, res, next);
        }   
    }
};