const assert = require('assert');
const Environment = require('./Environment')

/**
 * Eva Interpreter
 */
class Eva {
    /**
     * Creates an Eva instance with the global environment
     * @param {} exp 
     * @param {*} env 
     * @returns 
     */
    constructor(global = new Environment({
        null: null,

        true: true,
        false: false,

        VERSION: '0.1'
    })) {
        this.global = global
    }
    /**
     * Evaluates an expression in the given environment
     */
    eval(exp, env = this.global) {
        // -----------------------------
        // Self Evaluating Expressions
        if (isNumber(exp)) {
            return exp;
        }
        if (isString(exp)) {
            return exp.slice(1, -1)
        }

        // ------------------------------
        // Math operations
        if (exp[0] === '+') {
            return this.eval(exp[1], env) + this.eval(exp[2], env)
        }
        if (exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env)
        }
        if (exp[0] === '/') {
            return this.eval(exp[1], env) / this.eval(exp[2], env)
        }
        if (exp[0] === '-') {
            return this.eval(exp[1], env) - this.eval(exp[2], env)
        }

        // -------------------------------
        // Variable declaration: (var foo 100)
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env))
        }

        // -------------------------------
        // Variable access: foo
        if (isVariableName(exp)) {
            return env.lookup(exp)
        }

        // -------------------------------
        // Variable update: (set foo 100)
        if (exp[0] === 'set'){
            const [_, name, value] = exp
            return env.assign(name, this.eval(value, env))
        }


        // -------------------------------
        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env)
            return this._evalBlock(exp, blockEnv);
        }

        throw `Unimplemented: ${JSON.stringify(exp)}`
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;

        expressions.forEach(exp => {
            result = this.eval(exp, env);
        })

        return result
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

module.exports = Eva;

