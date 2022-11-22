const Type = require('../src/Type');

const {test} = require('./test_util');

module.exports = eva => {

    // variable declaration:
    test(eva, ['var', 'x', 10], Type.number );

    // variable access:
    test(eva, 'x', Type.number );

    // Global variable: 
    test(eva, 'VERSION', Type.string);
}