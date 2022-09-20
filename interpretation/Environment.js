/**
 * Environment: names storage
 */
class Environment {
    /**
     * Creates an environment with the given record
     */
    constructor(record = {}) {
        this.record = record
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

    lookup(name){
        if (!this.record.hasOwnProperty(name)){
            throw new ReferenceError(`Variable "${name}" is not defined`)
        }
        return this.record[name]
    }
}

module.exports= Environment