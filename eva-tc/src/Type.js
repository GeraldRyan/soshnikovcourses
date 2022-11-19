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