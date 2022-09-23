const Environment = require("../Environment");
const Eva = require("../Eva");

const tests = [
    require('./block.spec'),
    require('./math.spec'),
    require('./self_evaluating_expression.spec'),
    require('./variables.spec'),
    require('./if.spec'),
    require('./while.spec')
]

const eva = new Eva(new Environment({
    null: null,
    true: true,
    false: false,

    VERSION: '0.1'
}));

tests.forEach(t =>{
    t(eva)
})

console.log("All assertions passed")