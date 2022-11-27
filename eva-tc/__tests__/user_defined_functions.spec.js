const Type = require('../src/Type');
const { test, exec, testThrows } = require('./test_util');

module.exports = eva => {
    test(eva,
        `
        (def sqr ((x number)) -> number 
        (* x x))
        `,
        Type.fromString('Fn<number<number>>')
    );
    test(eva,
        `
        (def sqr ((x number)) -> number 
        (* x x))

        (square 2)

        `, Type.number
    );

    test(eva,
        `
        (def calc((x number) (y number)) -> number
            (begin
                (var z 30)
                (+ (* x y) z)    
            )
        )
        `,
        Type.fromString('Fn<number<number,number>>')
    );
    test(eva,
        `
        (def calc((x number) (y number)) -> number
            (begin
                (var z 30)
                (+ (* x y) z)    
            )
        )

        (calc 10 20)
        `,
        Type.number
    );

    // closures
    test(eva,
        `
        (var value 100)

        (def calc((x number) (y number)) -> Fn<number<number>>
            (begin
                (var z (+ x y))
                
                (def inner ((foo number)) -> number
                    (+ (+ foo z) value)
                )
            
            inner 

            )
        )
        (var fn (calc 10 20))

        (fn 30)
        `,
        Type.number
    );

    // recursive function:
    test(eva,
    `
    (def factorial ((x number)) -> number
        (if (== x 1)
            1
            (* x (factorial (- x 1 )))
        )
    )
    (factorial 5)
    `, Type.number)
}