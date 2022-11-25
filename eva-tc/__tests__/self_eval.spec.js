const assert = require('assert')
const { test } = require('./test_util')
const Type = require('../src/Type')

module.exports = eva =>{
    test(eva, 42, Type.number);
    test(eva, '"hello"', Type.string);
    test(eva, true, Type.boolean);
    test(eva, false, Type.boolean);
    test(eva, "true", Type.boolean);
    test(eva, "false", Type.boolean);
}