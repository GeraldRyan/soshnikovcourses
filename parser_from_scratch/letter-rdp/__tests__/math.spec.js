module.exports = test => {
    // Addition:
    test(`2+2;`, {
        type: 'Program',
        body: {
            type: 'ExpressionStatement',
            expression: {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'NumericLiteral',
                    value: 2
                },
                right: {
                    type: 'NumericLiteral',
                    value: 2
                }
            }
        }
    })

    // Nested Binary Expressions:
    // test(`3 + 2 - 2;`, {
    //     type: 'Program',
    //     body: {
    //         type: 'ExpressionStatement',
    //         expression: {
    //             type: 'BinaryExpression',
    //             operator: '-',
    //             left: {
    //                 type: 'BinaryExpression',
    //                 operator: '+',
    //                 left: {
    //                     type: 'NumericLiteral',
    //                     value: 3
    //                 },
    //                 right: {
    //                     type: 'NumericLiteral',
    //                     value: 2
    //                 }
    //             },
    //             right: {
    //                 type: 'NumericLiteral',
    //                 value: 2
    //             }
    //         }
    //     }
    // })
}