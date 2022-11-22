const Type = require('../src/Type');

const {test} = require('./test_util');

module.exports = eva => {

    // variable declaration:
    test(eva, ['var', 'x', 10], Type.number );

    // variable declaration with type check:
    test(eva, ['var', ['y', 'number'], 10], Type.number );
    test(eva, ['var', ['z', 'number'], 'x'], Type.number ); // can refer to variables as is called recursively

    // variable access:
    test(eva, 'x', Type.number );

    // Global variable: 
    test(eva, 'VERSION', Type.string);
}