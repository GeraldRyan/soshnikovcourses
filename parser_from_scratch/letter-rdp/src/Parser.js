/**
 * Letter parseArgs: recursive descent implmenentation
 */

const { Tokenizer } = require('./Tokenizer')

// ---------------------------
// Default AST node factories

const DefaultFactory = {
    Program(body) {
        return {
            type: 'Program',
            body
        }
    },
    EmptyStatement() {
        return {
            type: 'EmptyStatement'
        }
    },
    BlockStatement(body) {
        return {
            type: 'BlockStatement',
            body
        }
    },
    ExpressionStatement(expression) {
        return {
            type: 'ExpressionStatement',
            expression
        }
    },
    StringLiteral(value) {
        return {
            type: 'StringLiteral',
            value: value
        }
    },
    NumericLiteral(value) {
        return {
            type: 'NumericLiteral',
            value: value
        }
    },
}


// ---------------------
// S-Expression Factory

const SExpressionFactory = {
    Program(body) {
        return ['begin', body]
    },

    EmptyStatement() { },
    BlockStatement(body) {
        return ['begin', body]
    },
    ExpressionStatement(expression) {
        return expression
    },
    StringLiteral(value) {
        return value
        // return `"${value}"`
    },
    NumericLiteral(value) {
        return value
    }
}


// const AST_MODE = 's-expression'
const AST_MODE = 'default'

const factory = AST_MODE === 'default' ? DefaultFactory : SExpressionFactory

/**
 * This is the AstNode maker as opposed to the Token maker. It consumes tokens and makes nodes, and entire trees. 
 */
class Parser {

    /**
     * Initializes the parser
     */
    constructor() {
        this._string = ''
        this._tokenizer = new Tokenizer() // The tokenizer is embedded into the parser object. The parser is composed of a tokenizer, as well as the string to parse.
    }

    /**
     * Parses a string into an AST
     */
    parse(string) {
        this._string = string
        this._tokenizer.init(string)

        // Prime the tokenizer to obtain the first token which is our lookahead, used for predictive parsing
        this._lookahead = this._tokenizer.getNextToken()
        // Parse recursively starting from main entry point, the Program:

        return this.Program()
    }

    /**
     * Main entry point
     * 
     * Program
     *  : StatementList
     *  ;
     */
    Program() {
        return factory.Program(this.StatementList())
    }

    /**
     * StatementList
     *  :Statement
     *  | StatementList Statement -> Statement Statement Statement Statement
     *  ; 
     */
    StatementList(stopLookahead = null) {
        const statementList = [this.Statement()]

        while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
            statementList.push(this.Statement())
        }
        return statementList
    }

    /**
     * Statement
     *  : ExpressionStatement
     *  | BlockStatement
     *  | EmptyStatement
     *  ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ';': return this.EmptyStatement();
            case '{': return this.BlockStatement();
            default: return this.ExpressionStatement()
        }
    }

    /**
     * EmptyStatement
     *  : ';'
     *  ;
     */
    EmptyStatement() {
        this._eat(';')
        return factory.EmptyStatement()
    }

    /**
     * BlockStatement
     *  : '{' OptStatementList '}'
     *  ;
     */
    BlockStatement() {
        this._eat('{')
        const body = this._lookahead.type != '}' ? this.StatementList('}') : []
        this._eat('}')
        return factory.BlockStatement(body)
    }

    /**
     * ExpressionStatement
     *  : Expression ';'
     *  ;
     */
    ExpressionStatement() {
        const expression = this.Expression()

        this._eat(';') /// You better be sure you're at the end of your expression statement. 
        return factory.ExpressionStatement(expression)
    }

    /**
     * Expression
     *  : Literal
     *  // todo implement more types
     *  ;
     */
    Expression() {
        return this.AssignmentExpression();
    }

    /**
     * AssignmentExpression
     *  : AdditiveExpression
     *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *  ;
     */
    AssignmentExpression() {
        const left = this.AdditiveExpression()
        if (!this._isAssignmenOperator(this._lookahead.type)) {
            return left
        }

        return {
            type: 'AssignmentExpression',
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.AssignmentExpression(),
        }
    }

    /**
     * LeftHandSideExpression
     *     : Identifier
     *     ;
     */
    LeftHandSideExpression() {
        return this.Identifier()
    }

    /**
     * Identifier
     *     : IDENTIFIER
     *     ;
     */
    Identifier() {
        const name = this._eat('IDENTIFIER').value
        return {
            type: 'Identifier',
            name
        }
    }

    /**
     * Extra check whether it's a valid assignment target
     */
    _checkValidAssignmentTarget(node) {
        if (node.type === 'Identifier') {
            return node
        }
        throw new SyntaxError('Invalid left-hand side in assignment expression')
    }

    /**
     * Whether the token is an assignment operator
     */
    _isAssignmenOperator(tokenType) {
        return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN'
    }

    /**
     * AssignmentOperator
     *     : SIMPLE_ASSIGN
     *     | COMPLEX_ASSIGN
     *     ;
     */
    AssignmentOperator() {
        if (this._lookahead.type === 'SIMPLE_ASSIGN') {
            return this._eat('SIMPLE_ASSIGN')
        }
        return this._eat('COMPLEX_ASSIGN')
    }


    /**
     * AdditiveExpression
     *  : MultiplicativeExpression
     *  | AdditiveExpression ADDITIVE_OPERATOR Literal
     */
    AdditiveExpression() {
        return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR')
        let left = this.MultiplicativeExpression();

        while (this._lookahead.type === 'ADDITIVE_OPERATOR') {
            // Operator: +, -
            const operator = this._eat('ADDITIVE_OPERATOR').value

            const right = this.MultiplicativeExpression()

            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right,
            }
        }
        return left
    }

    /**
     * PrimaryExpression
     *  : MultiplicativeExpression
     *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR
     */
    MultiplicativeExpression() {
        return this._BinaryExpression('PrimaryExpression', 'MULTIPLICATIVE_OPERATOR')
        let left = this.PrimaryExpression();
        while (this._lookahead.type === 'MULTIPLICATIVE_OPERATOR') {
            // Operator: *, /
            const operator = this._eat('MULTIPLICATIVE_OPERATOR').value

            const right = this.PrimaryExpression()

            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right,
            }
        }
        return left
    }

    /**
     * Generic binary expression
     * 
     */
    _BinaryExpression(builderName, operatorToken) {

        let left = this[builderName]();
        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value

            const right = this[builderName]()

            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right,
            }
        }
        return left
    }

    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | LeftHandSideExpression
     * ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal()
        }
        switch (this._lookahead.type) {
            case '(': return this.ParenthesizedExpression()
            default:
                return this.LeftHandSideExpression();
        }
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return tokenType === 'NUMBER' || tokenType === 'STRING'
    }

    /**
     * ParenthesizedExpression
     *  : '(' Expression ')'
     *  ;
     * 
     * (Implements precedence inside AST)
     */
    ParenthesizedExpression() {
        this._eat('(')
        const expression = this.Expression()
        this._eat(')')
        return expression
    }

    /**
     *  Literal
     *  : NumericLiteral
     *  | StringLiteral
     *  ;
     */
    Literal() {
        switch (this._lookahead.type) {
            case 'NUMBER': return this.NumericLiteral();
            case 'STRING': return this.StringLiteral();
        }
        throw new SyntaxError(`Literal: unexpected literal production`)
    }


    /**
     *  StringLiteral
     *      : STRING
     *      ;
     */
    StringLiteral() {
        const token = this._eat('STRING')
        return factory.StringLiteral(token.value.slice(1, -1))
    }

    /**
     *  NumericLiteral
     *  : NUMBER
     *  ;
     */
    NumericLiteral() {
        const token = this._eat('NUMBER')
        return factory.NumericLiteral(token.value)
    }

    /**
     * Expects a token of a given type
     */
    _eat(tokenType) {
        const token = this._lookahead
        if (token == null) {
            throw new SyntaxError(`Unexpected end of input, expected: "${tokenType}`)
        }

        if (token.type !== tokenType) {
            throw new SyntaxError(`Unexpected token: "${token.value}", expected: "${tokenType}`)
        }

        // Advance to next token.
        this._lookahead = this._tokenizer.getNextToken()

        return token
    }
}

module.exports = {
    Parser
}