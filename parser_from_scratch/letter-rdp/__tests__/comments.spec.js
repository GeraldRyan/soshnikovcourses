// TODO Implement me
module.exports = test => {

    test(
        `
/**
 * skip this
 */
"hello";

// Number:
42;
10;
`,
        {
            "type": "Program",
            "body": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "StringLiteral",
                        "value": "hello"
                    }
                },
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "NumericLiteral",
                        "value": 42
                    }
                },
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "NumericLiteral",
                        "value": 10
                    }
                }
            ]
        })
}