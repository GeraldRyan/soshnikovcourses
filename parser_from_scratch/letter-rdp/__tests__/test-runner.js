/**
 * Main test runner.
 */

const assert = require('assert')
const { Parser } = require('../src/Parser')
const parser = new Parser()
// const program = `    '42' `
// const program = `42`
// const program = `'42'`
// const program = 
// `
// // Number:
// '42'
// `
// const program = 
// `
// /**
//  * skip this
//  */
// '42'
// `

/**
 * List of tests
 */
const tests =
    [
        require('./literals.spec'),
        require('./statement_list.spec'),
        require('./block.spec'),
        require('./empty_statement.spec'),
        require('./comments.spec'),
        require('./math.spec')
    ]

function exec() {
    const program =
        `
2+3*5;
        `

    const ast = parser.parse(program)
    console.log(JSON.stringify(ast, null, 2))
}

exec()


function test(program, expected) {
    const ast = parser.parse(program)
    try {
        assert.deepEqual(ast, expected)
    }
    catch (exception) {
        console.log('\x1b[31m ast', JSON.stringify(ast), '\x1b[0m')
        console.log("\x1b[32m expected: ", JSON.stringify(expected), '\x1b[0m')
        throw exception
    }
}

// Run all tests

tests.forEach(testRun => { testRun(test) })

console.log('All assertions passed')


// debugger tools
function inspectObject(object) {
    for (key in object) {
        console.log("the attribute " + key + " is equal to " + object[key]);
    }
}