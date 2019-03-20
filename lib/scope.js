// This is a port of scope lib
// Help.: https://github.com/diogolmenezes/scope/
class Scope {
    
    addScope(value) {
        this.scope = this.scope || { _chain: [] };
                       
        if (value) {
            Object.assign(this.scope, value);
        } 

        // coloca o objeto na chain caso ainda não esteja
        const object        = this.__proto__.constructor.name;
        const itsInTheChain = this.scope._chain.includes(object);   
        
        if (!itsInTheChain) {            
            // varre todas as propriedades que herdam de Scope e repassa o escopo
            const scopableProperties = Object.keys(this).filter(x => this[x] instanceof Scope);

            scopableProperties.map(property => {
                this[property].scope = this.scope;
                this[property].addScope();
            });

            this.scope._chain.push(object);
        }              
    }

    removeScope(name) {
        delete this.scope[name];
    }
}

module.exports = Scope;