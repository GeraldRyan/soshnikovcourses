const Environment = require("../Environment");
const Eva = require("../Eva");

const tests = [
    require('./block.spec'),
    require('./math.spec'),
    require('./self_evaluating_expression.spec'),
    require('./variables.spec'),
    require('./if.spec'),
    require('./while.spec'),
    require('./built_in_function.spec')
]

const eva = new Eva();

tests.forEach(t =>{
    t(eva)
})

eva.eval(['print', '"Hello"', '"world"'])

console.log("All assertions passed")