const assert = require('assert');
const EvaTC = require('../src/EvaTC');
const eva = new EvaTC();

const tests = [
    // require('./self_eval.spec'),
    // require('./math.spec'),
    require('./variable.spec'),
]

tests.forEach(test =>{
    test(eva)
})


console.log('All Assertions Passed!')