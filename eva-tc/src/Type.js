const TypeEnvironment = require("./TypeEnvironment");

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
    equals(other) {
        if (other instanceof Type.Alias){
            return other.equals(this)
        }
        return this.name === other.name;
    }

    /**
     * From string: 'number' -> Type.number
     */
    static fromString(typeStr) {
        if (this.hasOwnProperty(typeStr)) {
            return this[typeStr];
        }

        // Functions
        if (typeStr.includes('Fn<')){
            return Type.Function.fromString(typeStr);
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

/**
 * Boolean Type
 */
Type.boolean = new Type('boolean');

/**
 * Null Type
 */
Type.null = new Type('null');

/**
 * Function meta type
 */
Type.Function = class extends Type {
    constructor({ name = null, paramTypes, returnType }) {
        super(name);
        this.paramTypes = paramTypes;
        this.returnType = returnType;
        this.name = this.getName();
    }

    /**
     * Returns name: Fn<returnType<p1, p2, ...>>
     * 
     * Fn<number> - function which returns a number
     * 
     * Fn<number<number, number>> - function which returns a number and accepts two numbers
     */
    getName() {
        if (this.name == null) {
            const name = ['Fn<', this.returnType.getName()];

            // params
            if (this.paramTypes.length !== 0) {
                const params = [];
                for (let i = 0; i < this.paramTypes.length; i++) {
                    params.push(this.paramTypes[i].getName());
                }
                name.push('<', params.join(','), '>');
            }
            name.push('>');
            // this.name = name;
            // return name; // i assume one of these are necessary but dmitry didn't have them.  
        }
        return this.name;
    }

    /**
     * Equals
     */
    equals(other){
        if (this.paramTypes.length !== other.paramTypes.length){
            return false;
        }

        // same params
        for (let i = 0; i < this.paramTypes.length; i ++){
            if (!this.paramTypes[i].equals(other.paramTypes[i])){
                return false;
            }
        }

        // return type
        if (!this.returnType.equals(other.returnType)){
            return false;
        }
        return true;
    }

    /**
     * From string: 'Fn<number>' -> Type.Function
     */
    static fromString(typeStr){
        // already compiled
        if (Type.hasOwnProperty(typeStr)){
            return Type[typeStr];
        }

        // Function type with return and params:
        let matched = /^Fn<(\w+)<([a-z,\s]+)>>$/.exec(typeStr);

        if (matched != null) {
            const [_, returnTypeStr, paramsString] = matched;

            // param types:
            const paramTypes = paramsString.split(/,\s*/g).map(param => Type.fromString(param));

            return (Type[typeStr] = new Type.Function({
                name: typeStr,
                paramTypes,
                returnType: Type.fromString(returnTypeStr),
            }));
        }

        // Function type with return type only:
        matched = /^Fn<(\w+)>$/.exec(typeStr);

        if (matched != null){
            const [_, returnTypeStr] = matched;
            return (Type[typeStr] = new Type.Function({
                name: typeStr,
                paramTypes: [],
                returnType: Type.fromString(returnTypeStr)
            }))
        }
        throw `Type.Function.fromString: Unknown type: ${typeStr}.`;
    }
}

/**
 * Type alias: (type int number)
 */
Type.Alias = class extends Type {
    constructor({name, parent}){
        super(name);
        this.parent = parent;
    }

    /**
     * Equals
     */
    equals(other){
        if (this.name === other.name){
            return true;
        }
        return this.parent.equals(other);
    }

}



/**
 * Class type: (class ...)
 * 
 * Creates a new TypeEnvironment
 */
Type.Class = class extends Type{
    constructor({name, superClass = null}){
        super(name);
        this.superClass = superClass;
        this.env = new TypeEnvironment({}, superClass != Type.null ? superClass.env : null);
    }

    /**
     * Returns field type
     */
    getField(name){
        return this.env.lookup(name);
    }

    /**
     * Equals
     */
    equals(other){
        if (this === other){
            return true;
        }

        // Aliases:
        if (other instanceof Type.Alias){
            return other.equals(this);
        }

        // Super class:
        if (this.superClass != Type.null){
            return this.superClass.equals(other);
        }

    }
}

module.exports = Type