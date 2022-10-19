const Environment = require("../Environment");
const Eva = require("../Eva");

// There's something to be said for knowing how to create test runners, test utils and the tests themselves. We instantate one interpreter and run all the tests at once, not unlike the hack to run all Cypress tests at once in Cypress version 10. Importing a module automatically triggers running the code in the script. Of course this is necessary as you have to 'install' the functions and variables in an environment. If they are not exported, they can't be imported, so only select properties and funcions can be installed in a parent or host environment- i.e. those imported (in JS, unlike Python)
// Now I'm starting to learn. A module is like a class in that it is like it's own environment or namespace, but not everything is accessible- only the exported values. module.exports or whatever is like a pipe, or like a permission to install such exported properties or attributes to the importing environment. You can import a script for the side-effects of running it, as in the case of importing tests to trigger their run. In this case we just import them all to load them to an array, and then do a for-each

const tests = [
    require('./block.spec'),
    require('./math.spec'),
    require('./self_evaluating_expression.spec'),
    require('./variables.spec'),
    require('./if.spec'),
    require('./while.spec'),
    require('./built_in_function.spec'),
    require('./user_defined_function.spec'),
    require('./lambda_func.spec'),
    require('./switch.spec'),
    require('./class_implementation.spec'),
    // require('./module.spec'),
    // require('./import.spec')
]

const eva = new Eva();

tests.forEach(t =>{

    t(eva)
})

eva.eval(['print', '"Hello"', '"world"'])

console.log("All assertions passed")