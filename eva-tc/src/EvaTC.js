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
            return 'number';
        }

        /**
         * String: "foo"
         */
        if (this._isString(exp)) {
            return 'string';
        }

        throw `Unknown type for expression ${exp}.`
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
        return typeof exp === 'string'
    }

    
}

module.exports = EvaTC