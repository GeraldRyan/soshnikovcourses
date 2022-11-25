const Type = require('../src/Type');
const { test, exec, testThrows } = require('./test_util');

module.exports = eva =>{

    test(eva, `(<= 1 10)`, Type.boolean)

    // If expression: both branches should return the same type
    test(eva, 
        `
        (var x 10)
        (var y 20)

        (while (!= x 0)
            (set x (- x 1))
            (set y 2)
        )
        
        y
        `,
        Type.number)
}