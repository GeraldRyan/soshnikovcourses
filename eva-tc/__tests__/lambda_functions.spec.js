const Type = require('../src/Type');
const { test, exec, testThrows } = require('./test_util');

module.exports = eva =>{

    test(eva,
        `
        (lambda 
            ((x number)) -> number (* x x)    
        )
        `,
        Type.fromString('Fn<number<number>>')
        )

    test(eva, `
    (def onClick((callback Fn<number<number>>)) -> number
            (begin
                (var x 10)
                (var y 20)
                (callback (+ x y))    
            )
    )

    (onClick (lambda ((data number)) -> number (* data 10)))
    `, Type.number)

    test(eva,
        `
        ((lambda ((x number)) -> number (* x x)) 2 )
        `, Type.number)


    test(eva,
        
        // save lambda to variable
        `
        (var square (lambda ((x number)) -> number (* x x)))
        (square 2)
        `, Type.number)

}