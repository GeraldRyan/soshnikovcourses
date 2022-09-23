const assert = require('assert')
function test(eva, code, expected){
    const exp = evaParser.parse(code)
    assert.strictEqual(eva.eval(exp), expected)
}