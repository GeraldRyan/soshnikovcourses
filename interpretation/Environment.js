/**
 * Environment: names storage
 */
class Environment {
    /**
     * Creates an environment with the given record
     */
    constructor(record = {}, parent = null) {
        this.record = record
        this.parent = parent // this would be good to Typescript
    }
    /**
     * 
     * Creates a variable with the given name and value.
     * @param {} name 
     * @param {*} value 
     */
    define(name, value) {
        this.record[name] = value
        return value
    }

    /**
     * Updates an existing variable
     * @param {*} name 
     * @returns 
     */
    assign(name, value){
        this._resolve(name).record[name] = value
        return value
    }

    lookup(name) {
        return this._resolve(name).record[name]
    }

    _resolve(name){
        if (this.record.hasOwnProperty(name)){
            return this;
        }
        if (this.parent == null){
            throw new ReferenceError(`Variable "${name}" is not defined`)
        }

        return this.parent._resolve(name);

    }
}

module.exports = Environment