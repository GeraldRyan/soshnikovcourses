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
        require('./block.spec')
    ]

function exec() {
    const program =
        `
        /**
         * skip this
         */
        "hello";

        // Number:
        '42';
        `

    const ast = parser.parse(program)

    console.log(JSON.stringify(ast, null, 2))
}

exec()

function test(program, expected) {
    const ast = parser.parse(program)
    assert.deepEqual(ast, expected)
}

tests.forEach(testRun => { testRun(test) })

console.log('All assertions passed')