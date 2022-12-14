const Type = require('../src/Type');
const { test, exec, testThrows } = require('./test_util');

module.exports = eva =>{

    // Generic function:
    exec(eva,
    `
        // (def combine ((x number) (y number)) -> number (+ x y))
        // (def combine ((x string) (y string)) -> string (+ x y))

        (def combine <K> ((x K) (y K)) -> K (+ x y))

    `);

    // call a generic (explicit polymorphism)
    test(eva,
    `
        (combine <number> 2 3)

    `, Type.number)

    test(eva,
    `
        (combine <string> "hello, " "world!")

    `, Type.string)

    test(eva,
    `
        ((lambda <K> ((x K)) -> K (+ x x)) <number> 2)

    `, Type.number)
};