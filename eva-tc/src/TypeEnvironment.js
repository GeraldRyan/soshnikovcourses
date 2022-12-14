/**
 * TypeEnvironment: mapping from names to types.
 */
class TypeEnvironment{
    /**
     * Creates an env with the given record
     */
    constructor(record = {}, parent = null){
        this.record = record;
        this.parent = parent;
    }

    /**
     * creates variable with given name and type
     */
    define(name, type_){
        this.record[name] = type_;
        return type_;
    }

    /**
     * Returns the type of a defined variable, or throws if the variable is not defined
     */
    lookup(name){
        return this.resolve(name).record[name];
    }

    resolve(name) {
        if (this.record.hasOwnProperty(name)){
            return this;
        }
        if (this.parent === null){
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
        return this.parent.resolve(name);
    }
}

module.exports = TypeEnvironment;