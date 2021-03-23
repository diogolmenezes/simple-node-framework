const glob = require('glob');
const path = require('path');
const Loggable = require('./base/loggable');
const config = require('./config');

class Route extends Loggable {
    constructor() {
        super({
            module: 'SNF Route'
        });

        this.config = config;
        this.glob = glob;
        this.path = path;
    }

    // importing routes for all the modules
    importModuleRoutes() {
        this.glob.sync(path.join(process.cwd(), (config.dir || ''), 'api/modules/**/route.js')).forEach((file) => {
            const moduleName = this.path.basename(this.path.dirname(file));
            this.log.debug(`Importing [${moduleName}] routes from [${file}]`);
            require(this.path.resolve(file)); // eslint-disable-line
        });
    }

    // retreive route information
    // ex: { baseRoute: '/api', module: 'customer', full: '/api/customer' }
    info(routeFile) {
        const moduleName = this.path.basename(this.path.dirname(routeFile));
        const full = `${this.config.app.baseRoute}/${moduleName}`;

        return {
            full,
            baseRoute: this.config.app.baseRoute,
            module: moduleName
        };
    }
}

module.exports = {
    class: Route,
    instance: new Route()
};
