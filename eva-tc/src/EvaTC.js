const Type = require('./Type')

/**
 * Typed Eva: static typechecker.
 */
class EvaTC {

    /**
     * 
     * Infers and validates type of an expression
     */
    tc(exp) {
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

        // -------------
        // Math operations
        if (this._isBinary(exp)) {
            return this._binary(exp)
        }

        throw `Unknown type for expression ${exp}.`
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
    _binary(exp) {
        this._checkArity(exp, 2)

        const t1 = this.tc(exp[1])
        const t2 = this.tc(exp[2])

        const allowedTypes = this._getOperandTypesForOperator(exp[0])

        this._expectOperatorType(t1, allowedTypes, exp);
        this._expectOperatorType(t2, allowedTypes, exp);

        return this._expect(t2, t1, exp[2], exp)
    }

    /**
     * Returns allowed operand types for an operator
     */
    _getOperandTypesForOperator(operator){
        switch(operator){
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
     _expectOperatorType(type_, allowedTypes, exp){
        if (!allowedTypes.some(t => t.equals(type_))){
            throw `\nUnexpected type: ${type_} in ${exp}, allowed: ${allowedTypes}`;
        }
     }

    /**
     * expects a type
     */
     _expect(actualType, expectedType, value, exp){
        if (!actualType.equals(expectedType)){
            this._throw(actualType, expectedType, value, exp)
        }
        return actualType
     }

     /**
      * Throws for number of arguments
      */
     _throw(actualType, expectedType, value, exp){
        throw `\nExpected "${expectedType}" type for ${value} in ${exp}, but got "${actualType}" type.\n`
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