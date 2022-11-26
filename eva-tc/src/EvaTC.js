const { env } = require('process');
const Type = require('./Type')
const TypeEnvironment = require('./TypeEnvironment');

/**
 * Typed Eva: static typechecker.
 */
class EvaTC {

    /**
     * Creates Eva Typechecker instance with the global environment
     */
    constructor() {
        this.global = this._createGlobal();
    }

    /**
     * Evaluates global code wrapping into a block (installs variables of implicit block into global)
     */
    tcGlobal(exp) {
        return this._tcBody(exp, this.global);
    }

    /**
     * Checks body (global or function)
     */
    _tcBody(body, env) {
        if (body[0] === 'begin') {
            return this._tcBlock(body, env);
        }
        return this.tc(body, env);
    }

    /**
     * 
     * Infers and validates type of an expression
     */
    tc(exp, env = this.global) {
        // -------------------------------------------
        // Self-evaluating:

        /**
         * Numbers: 10
         */
        if (this._isNumber(exp)) {
            return Type.number;
        }

        /**
         * String: "foo"
         */
        if (this._isString(exp)) {
            return Type.string;
        }

        // ----------------------
        // Boolean true | false
        if (this._isBoolean(exp)) {
            return Type.boolean;
        }

        // -------------
        // Math operations
        if (this._isBinary(exp)) {
            return this._binary(exp, env)
        }

        // ------------
        // Boolean binary:

        if (this._isBooleanBinary(exp)) {
            return this._booleanBinary(exp, env);
        }

        // Variable Declaration
        // with typecheck: (var (x number) "foo") // error

        if (exp[0] === 'var') {
            const [_tag, name, value] = exp;

            // Infer actual type:
            const valueType = this.tc(value, env);

            // with type check:
            if (Array.isArray(name)) {
                const [varName, typeStr] = name;

                const expectedType = Type.fromString(typeStr);

                // check this type:
                this._expect(valueType, expectedType, value, exp);

                return env.define(varName, expectedType);
            }

            // simple name
            return env.define(name, valueType);
        }

        // variable access: foo

        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        // variable update: (set x 10)

        if (exp[0] === 'set') {
            const [_, ref, value] = exp;

            // the type of the new value should match tot he previous type when the variable was defined
            const valueType = this.tc(value, env);
            const varType = this.tc(ref, env);

            return this._expect(valueType, varType, value, exp);

        }

        // Block
        if (exp[0] === 'begin') {
            const blockEnv = new TypeEnvironment({}, env)
            return this._tcBlock(exp, blockEnv);
        }


        /**
         * if-expression
         * 
         */
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;

            // Boolean condition:
            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            const t2 = this.tc(consequent, env);
            const t3 = this.tc(alternate, env);

            return this._expect(t3, t2, exp, exp)
        }

        /**
         * while expression:
         */
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;

            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            return this.tc(body, env);
        }

        // ----------------------------
        // Function declaration: (def square (x number) -> number (* x x))
        if (exp[0] === 'def') {
            const [_tag, name, params, _retDel, returnTypeStr, body] = exp;
            return env.define(
                name,
                this._tcFunction(params, returnTypeStr, body, env
                ));
        }

        console.trace()
        throw `Unknown type for expression ${exp}.`
    }

    /**
     * checks a function body.
     */
    _tcFunction(params, returnTypeStr, body, env) {
        const returnType = Type.fromString(returnTypeStr);

        // Parameters environment and types:
        const paramsRecord = {};
        const paramTypes = [];

        params.forEach(([name, typeStr]) => {
            const paramType = Type.fromString(typeStr);
            paramsRecord[name] = paramType;
            paramTypes.push(paramType);
        })

        const fnEnv = new TypeEnvironment(paramsRecord, env);

        // check the body in the extended environment:
        const actualReturnType = this._tcBody(body, fnEnv);

        // check return type:
        if (!returnType.equals(actualReturnType)) {
            throw `Expected function ${body} to return ${returnType}, but got ${actualReturnType} instead`;
        }

        // Function type records its parameters and return type,
        // so we can use them to validate function calls.
        return new Type.Function({
            paramTypes,
            returnType
        });
    }



    /**
     * checks a block
     */
    _tcBlock(block, env) {
        let result;

        const [_tag, ...expressions] = block;

        expressions.forEach(exp => {
            result = this.tc(exp, env)
        })

        return result;
    }

    /**
     * Whether the expression is a variable name
     */
    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_:]+$/.test(exp);
    }

    /**
     * Creates a global type environment
     */
    _createGlobal() {
        return new TypeEnvironment({
            'VERSION': Type.string,
        });
    }

    /**
     * Whether the expression is boolean binary
     */
    _isBooleanBinary(exp) {
        return (
            exp[0] === '==' ||
            exp[0] === '!=' ||
            exp[0] === '>=' ||
            exp[0] === '<=' ||
            exp[0] === '>' ||
            exp[0] === '<'
        )
    }

    /**
     * Boolean binary operators.
     */
    _booleanBinary(exp, env) {
        this._checkArity(exp, 2);

        const t1 = this.tc(exp[1], env);
        const t2 = this.tc(exp[2], env);

        this._expect(t2, t1, exp[2], exp);

        return Type.boolean;
    }

    /**
     * Whether the expression is binary
     */
    _isBinary(exp) {
        return /^[+\-*/]$/.test(exp[0])
    }

    /**
     * Binary operators
     */
    _binary(exp, env) {
        this._checkArity(exp, 2)

        const t1 = this.tc(exp[1], env)
        const t2 = this.tc(exp[2], env)

        const allowedTypes = this._getOperandTypesForOperator(exp[0])

        this._expectOperatorType(t1, allowedTypes, exp);
        this._expectOperatorType(t2, allowedTypes, exp);

        return this._expect(t2, t1, exp[2], exp)
    }

    /**
     * Returns allowed operand types for an operator
     */
    _getOperandTypesForOperator(operator) {
        switch (operator) {
            case '+':
                return [Type.string, Type.number]
            case '-':
                return [Type.number]
            case '/':
                return [Type.number]
            case '*':
                return [Type.number]
            default:
                throw `Unknown operator: ${operator}.`;
        }
    }

    /**
     * Throw if operator type doesn't expect the operand;
     */
    _expectOperatorType(type_, allowedTypes, exp) {
        if (!allowedTypes.some(t => t.equals(type_))) {
            throw `\nUnexpected type: ${type_} in ${exp}, allowed: ${allowedTypes}`;
        }
    }

    /**
     * expects a type
     */
    _expect(actualType, expectedType, value, exp) {
        if (!actualType.equals(expectedType)) {
            this._throw(actualType, expectedType, value, exp)
        }
        return actualType
    }

    /**
     * Throws for number of arguments
     */
    _throw(actualType, expectedType, value, exp) {
        throw `\nExpected "${expectedType}" type for ${value} in ${exp}, but got "${actualType}" type.\n`
    }


    /**
     * Whether the expression is a boolean
     */
    _isBoolean(exp) {
        return typeof exp === 'boolean' || exp === 'true' || exp === 'false';
    }

    /**
     * Throws for number of arguments
     */
    _checkArity(exp, arity) {
        if (exp.length - 1 !== arity) {
            throw `\n Operator '${exp[0]}' expects ${arity} operands, ${exp.length - 1} given in ${exp}.\n`
        }
    }


    /**
     * Whether expression is a number.
     */
    _isNumber(exp) {
        return typeof exp === 'number'
    }

    /**
     * Whether expression is a string.
     */
    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }


}

module.exports = EvaTC