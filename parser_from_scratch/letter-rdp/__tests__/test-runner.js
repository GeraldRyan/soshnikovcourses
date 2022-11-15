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
        require('./math.spec'),
        require('./assignment.spec'),
        require('./variables.spec'),
        require('./if.spec'),
        require('./relational.spec'),
        require('./equality.spec'),
        require('./logical.spec'),
        require('./unary.spec'),
        require('./while.spec'),
        require('./dowhile.spec'),
        require('./forloop.spec'),
        require('./function_declaration.spec'),
        require('./member.spec'),
        require('./call.spec'),
        require('./class.spec'),
    ]

function exec() {
    const program =
        `
        class Point {
            def constructor(x,y){
                this.x = x;
                this.y = y;
            }
            def calc() {
                return this.x + this.y;
            }
        }

        class Point3D extends Point {
            def constructor(x,y,z){
                super(x,y);
                this.z = z;
            }

            def calc() {
                return super() + this.z;
            }
        }

        let p = new Point3D(10,20,30);
        p.calc();
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