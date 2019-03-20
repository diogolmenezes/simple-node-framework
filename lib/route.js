const Loggable = require('./base/loggable');
const config = require('./config');
const glob = require('glob');
const path = require('path');

class Route extends Loggable {
    constructor() {
        super({
            module: 'Base Route'
        });

        this.config = config;
        this.glob = glob;
        this.path = path;
    }

    // importa as rotas de todos os modulos da aplicação localizados na pasta modules
    importModuleRoutes() {
        this.glob.sync('api/modules/**/route.js').forEach((file) => {
            this.log.debug(`Importando rotas de [${file}]`);
            require(this.path.resolve(file));
        });
    }

    // calcula informações de rota do modulo
    // ex.: { base: 'minha-aplicacao', module: 'fatura', full: 'minha-aplicacao.fatura' }
    info(routeFile) {
        const moduleName = this.path.basename(this.path.dirname(routeFile));
        const full = `${this.config.app.baseRoute}/${moduleName}`;

        return {
            full,
            base: this.config.app.baseRoute,
            module: moduleName,
        };
    }
}

module.exports = new Route();
