const assert = require('assert')
const evaParser = require('../parser/evaParser')
function test(eva, code, expected){
    console.log('code raw\n', code)
    const exp = evaParser.parse(code)
    console.log('parsed\n', exp)
    assert.strictEqual(eva.eval(exp), expected)
}

module.exports = {
    test
}