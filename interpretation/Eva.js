const assert = require('assert');

/**
 * Eva Interpreter
 */
class Eva {
    eval(exp){
        // -----------------------------
        // Self Evaluating Expressions
        if (isNumber(exp)){
            return exp;
        }
        if (isString(exp)){
            return exp.slice(1, -1)
        }

        // ------------------------------
        // Math operations
        if (exp[0] === '+'){
            return this.eval(exp[1]) + this.eval(exp[2])
        }
        if (exp[0] === '*'){
            return this.eval(exp[1]) * this.eval(exp[2])
        }
        if (exp[0] === '/'){
            return this.eval(exp[1]) / this.eval(exp[2])
        }
        if (exp[0] === '-'){
            return this.eval(exp[1]) - this.eval(exp[2])
        }
        throw 'Unimplemented'
    }
}

function isNumber(exp){
    return typeof exp === 'number';
}

function isString(exp){
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

const eva = new Eva();
assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"foo"'), 'foo');
assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10)
assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11)
assert.strictEqual(eva.eval(['+', ['-', 3, 2], 5]), 6)
assert.strictEqual(eva.eval(['+', ['/', 3, 2], 5]), 6.5)

console.log("All assertions passed")