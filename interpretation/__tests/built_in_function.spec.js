const assert = require('assert')
const {test} = require('./test-utils')

module.exports = eva => {
// Math operations:
test(eva, `(+ 1 5)`, 6);
test(eva, `(+ (+ 3 2) 5)`, 10)
test(eva, `(+ (* 3 2) 5)`, 11)
test(eva, `(+ (- 3 2) 5)`, 6)
test(eva, `(+ (/ 3 2) 5)`, 6.5)

// comparison

test(eva, `(> 1 5)`, false)
test(eva, `(< 1 5)`, true)
test(eva, `(<= 5 5)`, true)
// test(eva, `(>= 5 5)`, true)
test(eva, `(= 5 5)`, true)
}