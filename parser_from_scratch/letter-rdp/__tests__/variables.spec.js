module.exports = test => {
    // variable declararion with initialization
    test(`let x = 42;`, {
        type: 'Program',
        body: [
            {
                type: 'VariableStatement',
                declarations: [
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'x',
                        },
                        init: {
                            type: 'NumericLiteral',
                            value: 42
                        }
                    }
                ]
            }

        ]
    })

    // Variable Declaration, no init
    test(`let x;`, {
        type: 'Program',
        body: [
            {
                type: 'VariableStatement',
                declarations: [
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'x',
                        },
                        init: null
                    }
                ]
            }

        ]
    })
    // Multiple Variable Declaration, no init
    test(`let x, y;`, {
        type: 'Program',
        body: [
            {
                type: 'VariableStatement',
                declarations: [
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'x',
                        },
                        init: null
                    },
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'y',
                        },
                        init: null
                    }
                ]
            }

        ]
    })
    // Multiple Variable Declaration initialized
    test(`let x, y = 55;`, {
        type: 'Program',
        body: [
            {
                type: 'VariableStatement',
                declarations: [
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'x',
                        },
                        init: null
                    },
                    {
                        type: 'VariableDeclaration',
                        id: {
                            type: 'Identifier',
                            name: 'y',
                        },
                        init: {
                            type: 'NumericLiteral',
                            value: 55
                        }
                    }
                ]
            }

        ]
    })
}