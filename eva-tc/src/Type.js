/**
 * Type class
 */
class Type {
    constructor(name) {
        this.name = name;
    }


    /**
     * Returns name
     */
    getName() {
        return this.name;
    }

    /**
     * String representation
     */
    toString() {
        return this.getName();
    }

    /**
     * Equals.
     */
    equals(other){
        return this.name === other.name;
    }

    /**
     * From string: 'number' -> Type.number
     */
    static fromString(typeStr){
        if (this.hasOwnProperty(typeStr)){
            return this[typeStr];
        }
    throw `Unknown type: ${typeStr}`; // todo implement user defined types
    }
}

/**
 * Number type.
 */
Type.number = new Type('number')

/**
 * String type.
 */
Type.string = new Type('string')

module.exports = Type