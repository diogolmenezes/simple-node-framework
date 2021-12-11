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
        const filesJs = path.join(process.cwd(), (this.config.dir || ''), 'api/modules/**/route.js');
        const filesTs = path.join(process.cwd(), (this.config.dir || ''), 'api/modules/**/route.ts');
        const routeFiles = [
            ...this.glob.sync(filesJs),
            ...this.glob.sync(filesTs)
        ];
        routeFiles.forEach((file) => {
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
