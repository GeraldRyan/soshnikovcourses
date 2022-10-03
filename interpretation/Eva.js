const Environment = require('./Environment')
const Transformer = require('./transformer/Transformer')

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
    constructor(global = GlobalEnvironment) {
        this.global = global
        this._transformer = new Transformer()
    }
    /**
     * Evaluates an expression in the given environment
     */
    eval(exp, env = this.global) {
        // -----------------------------
        // Self Evaluating Expressions
        if (this._isNumber(exp)) {
            return exp;
        }
        if (this._isString(exp)) {
            return exp.slice(1, -1)
        }

        // ------------------------------
        // Math operations -- see built-ins

        // -------------------------------
        // // comparison operators
        // if (exp[0] === '>') {
        //     return this.eval(exp[1], env) > this.eval(exp[2], env)
        // }

        // if (exp[0] === '>=') {
        //     return this.eval(exp[1], env) >= this.eval(exp[2], env)
        // }

        if (exp[0] === '<') {
            return this.eval(exp[1], env) < this.eval(exp[2], env)
        }

        if (exp[0] === '<=') {
            return this.eval(exp[1], env) <= this.eval(exp[2], env)
        }

        if (exp[0] === '=') {
            return this.eval(exp[1], env) === this.eval(exp[2], env)
        }


        // -------------------------------
        // Variable declaration: (var foo 100)
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env))
        }

        // -------------------------------
        // Variable access: foo
        if (this._isVariableName(exp)) {
            return env.lookup(exp)
        }

        // -------------------------------
        // Variable update: (set foo 100)
        if (exp[0] === 'set') {
            const [_, name, value] = exp
            return env.assign(name, this.eval(value, env))
        }


        // -------------------------------
        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env)
            return this._evalBlock(exp, blockEnv);
        }

        // -------------------------------
        // if-expression: 
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp
            if (this.eval(condition, env)) {
                return this.eval(consequent, env)
            }
            return this.eval(alternate, env)
        }

        // -------------------------------
        // while-loop: 
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp
            // console.log(body)
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env)
            }
            return result
        }

        // -------------------------------
        // Function Declaration: (def sauare (x) (* x x))

        // Syntactic sugar for: (var square (lambda)(x)(* x x))

        if (exp[0] === 'def') {
            const varExp = this._transformer.transformDefToVarLambda(exp)
            return this.eval(varExp, env)
        }

        // ------------------------------
        // Lambda function: (lambda (x) (* x x))
        if (exp[0] === 'lambda'){
            const [_tag, params, body] = exp

            return{
                params,
                body,
                env, // closure
            }
        }

        // -------------------------------
        // Function call:
        // (print "Hello World")
        // (+ x 5)
        // (> foo bar)
        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env)
            const args = exp.slice(1).map(arg => this.eval(arg, env))

            // 1. native function:
            if (typeof fn === 'function') {
                return fn(...args)
            }

            // 2. User-defined function (def square (x) (* x x))

            const activationRecord = {}

            fn.params.forEach((param, index)=>{
                activationRecord[param] = args[index]
            })

            const activationEnv = new Environment(
                activationRecord, 
                // env // ? - dynamic scope, we don't want
                fn.env // static scope!
            )

            return this._evalBody(fn.body, activationEnv)

        }

        throw `Unimplemented: ${JSON.stringify(exp)}`
    }

    _evalBody(body, env){
        if (body[0] == 'begin'){
            return this._evalBlock(body, env)
        }
        return this.eval(body, env)
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;

        expressions.forEach(exp => {
            result = this.eval(exp, env);
        })

        return result
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }

    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z_][a-zA-Z0-9_]*$/.test(exp);
    }
}

/**
 * Default global env
 */
const GlobalEnvironment = new Environment({
    null: null,
    true: true,
    false: false,

    VERSION: '0.1',

    '+'(op1, op2) {
        return op1 + op2
    },
    '*'(op1, op2) {
        return op1 * op2
    },
    '-'(op1, op2) {
        if (op2 == null) {
            return -op1
        }
        return op1 - op2
    },
    '/'(op1, op2) {
        return op1 / op2
    },
    '>'(op1, op2) {
        return op1 > op2
    },
    '<'(op1, op2) {
        return op1 < op2
    },
    // for some reason these aren't working
    '>='(op1, op2) {
        return op1 >= op2
    },
    '<='(op1, op2) {
        return op1 <= op2
    },
    '='(op1, op2) {
        return op1 === op2
    },

    print(...args){
        console.log(...args)
    }
})

module.exports = Eva;

