// This is a port of scope lib
// ScopeJs is a js lib that creates an scope to share information between objects.
// One of best uses of scope is to share information on request lifecicle.
// Help.: https://github.com/diogolmenezes/scope/
class Scope {
    
    // add on scope
    addScope(value) {
        this.scope = this.scope || { _chain: [] };
                       
        if (value) {
            Object.assign(this.scope, value);
        } 

        // put the objsct in the chain if its not
        const object        = this.__proto__.constructor.name;
        const itsInTheChain = this.scope._chain.includes(object);   
        
        if (!itsInTheChain) {            
            // scans all properties that inherit from Scope and passes the scope
            const scopableProperties = Object.keys(this).filter(x => this[x] instanceof Scope);

            scopableProperties.map(property => {
                this[property].scope = this.scope;
                this[property].addScope();
            });

            this.scope._chain.push(object);
        }              
    }

    // remove from scope
    removeScope(name) {
        delete this.scope[name];
    }
}

module.exports = Scope;