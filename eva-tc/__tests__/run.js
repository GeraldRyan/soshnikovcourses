const assert = require('assert');
const EvaTC = require('../src/EvaTC');
const eva = new EvaTC();

const tests = [
    require('./self_eval.spec'),
    require('./math.spec'),
    require('./variable.spec'),
    require('./block.spec'),
    require('./if.spec'),
    require('./while.spec'),
    require('./user_defined_functions.spec'),
    require('./built_in_function.spec'),
    require('./lambda_functions.spec'),
    require('./alias.spec'),
    require('./class.spec'),
]

tests.forEach(test =>{
    test(eva)
})


console.log('All Assertions Passed!')