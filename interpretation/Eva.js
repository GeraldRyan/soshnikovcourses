const Environment = require('./Environment')
const Transformer = require('./transformer/Transformer');
const evaParser = require('./parser/evaParser')
const fs = require('fs')

// Todo (Gerald) - 
// 1. Implement in Typescript
// 2. Remove comments 
// 3. Finish the syntactic sugar aspects
// 4. Standardize test names
// 5. Remove or improve comments. 
// 6. .....

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

    evalGlobal(exp) {
        return this._evalBody(exp, this.global)
    }

    /**
     * Evaluates an expression in the given environment
     */
    eval(exp, env = this.global) { // this is very clever, allowing one to pass an env. 
        // all eval calls must or should be passed an environment in which to lookup properties and entries.
        // The environment param enables blocks and block scope, which enables so many other things like function scope, closures and classes ultimately. 

        // -----------------------------
        // Self Evaluating Expressions
        // These are necessary and allow recursion with a base case exit point. Look for this type of code in real world language implementations
        if (this._isNumber(exp)) {
            return exp;
        }
        if (this._isString(exp)) {
            return exp.slice(1, -1) // parentheses?
        }


        // I thought we needed this. We don't. 
        // if (exp === null){ 
        //     return false
        // }

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
        // this method is critical for implementing higher level aspects. 
        if (this._isVariableName(exp)) {
            return env.lookup(exp) // calls lookup which calls resolve and spits error msg if not found. 
        }

        // -------------------------------
        // Variable update: (set foo 100)
        if (exp[0] === 'set') {
            const [_, ref, value] = exp // reference can be variable name or instance prop

            // assignment to property
            if (ref[0] === 'prop') {
                const [_tag, instance, propName] = ref
                const instanceEnv = this.eval(instance, env) // evaluating a class returns an env
                // if this was TS we would define instanceEnv as Environment type
                return instanceEnv.define(propName, this.eval(value, env)) // define the prop in the instance Env
            }

            // simple assignment
            return env.assign(ref, this.eval(value, env))
        }


        // -------------------------------
        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env) // this line is key to whole code and much more
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
        // Function Declaration: (def square (x) (* x x))
        // Syntactic sugar for: (var square (lambda)(x)(* x x))

        if (exp[0] === 'def') {
            const varExp = this._transformer.transformDefToVarLambda(exp)
            return this.eval(varExp, env)
        }

        // --------------------------------
        // Switch-expression: (switch (cond1, block1))
        // Syntactic sugar for nested if-expressions

        if (exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchToIf(exp);

            return this.eval(ifExp, env)
        }

        // ---------------------------------
        // For-loop (for init condition modifier body)
        // Syntactic sugar for (begin init (while condition (begin body modifier)))

        // IMPLEMENT ME
        if (exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp)
            return this.eval(whileExp, env)
        }

        // -----------------------------------
        // increment: (++ foo)
        // Syntactic sugar for: (set foo (+ foo 1))
        if (exp[0] === '++') {
            const setExp = this._transformer.transformIncToSet(exp)
            return this.eval(setExp, env)
        }

        // -----------------------------------
        // increment: (+= foo)
        // Syntactic sugar for: (set foo (+ foo inc))
        if (exp[0] === '+=') {
            const setExp = this._transformer.transformIncValToSet(exp)
            return this.eval(setExp, env)
        }

        // -----------------------------------
        // decrement: (-- foo)
        // Syntactic sugar for: (set foo (- foo 1))
        if (exp[0] === '--') {
            const setExp = this._transformer.transformDecToSet(exp)
            return this.eval(setExp, env)
        }
        // -----------------------------------
        // decrement: (-= foo)
        // Syntactic sugar for: (set foo (- foo dec))
        if (exp[0] === '-=') {
            const setExp = this._transformer.transformDecValToSet(exp)
            return this.eval(setExp, env)
        }
        // IMPLEMENT ME


        // ------------------------------
        // Lambda function: (lambda (x) (* x x))
        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp

            // A function is just a simple object! It translates the array elements into object 
            // elements of the variable names 
            // Invocation is where the magic happens. Invocation processes a function object. I wonder how V8 
            // implements funtions as objects, if it's like this. 
            return {
                params,
                body,
                env, // closure
            }
        }

        // -------------------------------
        // Class declaration: (class <name> <parent> <Body>)
        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp
            const parentEnv = this.eval(parent, env) || env // env is the base global?
            const classEnv = new Environment({}, parentEnv)
            this._evalBody(body, classEnv) // install properties and methods of body in this env here
            // this.global.define(name, classEnv)


            return env.define(name, classEnv) // side effect (install) and return env, which is what a class is
        }

        // --------------------------------
        // Super expressions: (super <ClassName>)
        if (exp[0] === 'super') {
            const [_tag, className] = exp
            return this.eval(className, env).parent
        }

        // --------------------------------
        // Class instantiation: (new <Class> <Arguments>...)

        if (exp[0] === 'new') {
            // an instance of a class is an environment

            const classEnv = this.eval(exp[1], env) // exp[1] == Point == typeof classEnv  

            const instanceEnv = new Environment({}, classEnv)

            const args = exp.slice(2).map(arg => this.eval(arg, env))

            this._callUserDefinedFunction(classEnv.lookup('constructor'), // constructors live in classEnv
                [instanceEnv, ...args] // instanceEnv == 'this' or 'self'; always passed
            )
            return instanceEnv // returns 'this' (now you see things from the bottom of the lake)
        }
        // -----------------------
        // class Property access: (prop <instance> <name>)
        // Would <instance>.<propname> be hard to implement
        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp // e.g. ['prop', 'p', 'calc'] or ['prop', 'this', 'y']
            const instanceEnv = this.eval(instance, env)
            return instanceEnv.lookup(name) // perform simple lookup in env
        }
        
        // ---------------------------------
        // Module declaration: (module <body>)
        

        if (exp[0] === 'module') {
            const [_tag, name, body] = exp

            const moduleEnv = new Environment({}, env)

            this._evalBody(body, moduleEnv)
            return env.define(name, moduleEnv)
        }
        
        // ---------------------------------
        // Module import: (import <name>)

        if (exp[0] === 'import') {
            const [_tag, name] = exp

            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.eva`, 'utf-8'
            )

            const body = evaParser.parse(`(begin ${moduleSrc})`)

            const moduleExp = ['module', name, body]

            return this.eval(moduleExp, this.global)
        }


        // -------------------------------
        // Function call (invocation | invoke):
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

            return this._callUserDefinedFunction(fn, args) // pass name and args (args based on env)

        }


        throw `Unimplemented: ${JSON.stringify(exp)}`
    }

    _callUserDefinedFunction(fn, args) {
        const activationRecord = {}

        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index] // install the args into the param slots
        })

        const activationEnv = new Environment(
            activationRecord,
            // env // dynamic scope; we don't want
            fn.env // static scope, we want! 
        )

        return this._evalBody(fn.body, activationEnv)
    }

    _evalBody(body, env) {
        if (body[0] == 'begin') {
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
        // Complex programming is built on very simple principles, meticulously applied
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

    print(...args) {
        console.log(...args)
    }
})

module.exports = Eva;