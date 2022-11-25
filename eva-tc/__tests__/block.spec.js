const Type = require('../src/Type');
const { test, exec, testThrows } = require('./test_util');

module.exports = eva => {

    //Block: sequence of expressions
    test(eva,

        ['begin',
            ['var', 'x', 10],
            ['var', 'y', 20],
            ['+', ['*', 'x', 10], 'y']
        ]
        , Type.number);


    // S-expression format (parser integrated)
    test(eva,
        `
        (begin
            (var x 10)
            (var y 20)
            (+ (* x 10) y)    
        )
        `, Type.number);

    // implicit block
    test(eva,
        `
        (var x 10)
        (var y 20)
        (+ (* x 10) y)    
        `, Type.number);

    // Block: local scope
    test(eva,
        ['begin',
            ['var', 'x', 10],

            ['begin',
                ['var', 'x', '"hello"'],
                ['+', 'x', '"world"']
            ],

            ['-', 'x', 5]
        ],
        Type.number);

    // Block: access parent scopes
    test(eva,
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'y', 20],
                ['+', 'x', 'y']
            ],
        ],
        Type.number
    )

    test(eva,
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'y', 20],
                ['set', 'x', ['+', 'x', 'y']],
            ]

        ],
        Type.number)

    // test implicit block installs variables into global
    exec(eva, `(var zz 10)`);
    test(eva, 
    `
        (var y 20)
        (+ (* zz 10) y)
    `, Type.number);


    // does not work
    // testThrows(eva,
    //     ['begin',
    //         ['var', 'x', 10],
    //         ['set', 'x', '"foo"'],
    //     ])

}