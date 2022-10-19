const assert = require('assert')
const evaParser = require('../parser/evaParser')
function test(eva, code, expected, verbose=true){
    const exp = evaParser.parse(`(begin ${code})`) // does this add overhead, creating a new environment in all blocks?
    if (verbose){
        console.log('code raw\n', code)
        console.log('parsed\n', exp)
    }
    assert.strictEqual(eva.evalGlobal(exp), expected)
}

module.exports = {
    test
}