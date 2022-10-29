module.exports = test => {
    // Addition:
    test(`2+2;`, {
        type: 'Program',
        body: [{
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
        }]
    })

    // Nested Binary Expressions:
    test(`3 + 2 - 2;`, {
        type: 'Program',
        body: [{
            type: 'ExpressionStatement',
            expression: {
                type: 'BinaryExpression',
                operator: '-',
                left: {
                    type: 'BinaryExpression',
                    operator: '+',
                    left: {
                        type: 'NumericLiteral',
                        value: 3
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 2
                    }
                },
                right: {
                    type: 'NumericLiteral',
                    value: 2
                }
            }
        }]
    })

    // Super Nested Binary Expressions (because why not):
    test(`3 + 2 + 2 -2 + 3 + 1 + 7 - 2;`, {
        "type": "Program",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "BinaryExpression",
                    "operator": "-",
                    "left": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                                "type": "BinaryExpression",
                                "operator": "+",
                                "left": {
                                    "type": "BinaryExpression",
                                    "operator": "-",
                                    "left": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "BinaryExpression",
                                            "operator": "+",
                                            "left": {
                                                "type": "NumericLiteral",
                                                "value": 3
                                            },
                                            "right": {
                                                "type": "NumericLiteral",
                                                "value": 2
                                            }
                                        },
                                        "right": {
                                            "type": "NumericLiteral",
                                            "value": 2
                                        }
                                    },
                                    "right": {
                                        "type": "NumericLiteral",
                                        "value": 2
                                    }
                                },
                                "right": {
                                    "type": "NumericLiteral",
                                    "value": 3
                                }
                            },
                            "right": {
                                "type": "NumericLiteral",
                                "value": 1
                            }
                        },
                        "right": {
                            "type": "NumericLiteral",
                            "value": 7
                        }
                    },
                    "right": {
                        "type": "NumericLiteral",
                        "value": 2
                    }
                }
            }
        ]
    })

    // Multiplication:
    test(`2 * 2 * 2;`, {
        type: 'Program',
        body: [{
            type: 'ExpressionStatement',
            expression: {
                type: 'BinaryExpression',
                operator: '*',
                left: {
                    type: 'BinaryExpression',
                    operator: '*',
                    left: {
                        type: 'NumericLiteral',
                        value: 2
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 2
                    }
                },
                right: {
                    type: 'NumericLiteral',
                    value: 2
                },

            }
        }]
    })

    // Multiplication:
    test(`3 + 2 * 4;`, {
        type: 'Program',
        body: [{
            type: 'ExpressionStatement',
            expression: {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'NumericLiteral',
                    value: 3
                },
                right: {
                    type: 'BinaryExpression',
                    operator: '*',
                    left: {
                        type: 'NumericLiteral',
                        value: 2
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 4
                    }
                },

            }
        }]
    })
}