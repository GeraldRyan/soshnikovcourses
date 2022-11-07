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
     *  | EmptyStatement,
     *  | VariableStatement
     *  | IfStatement
     *  ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ';': return this.EmptyStatement();
            case 'if': return this.IfStatement();
            case '{': return this.BlockStatement();
            case 'let': return this.VariableStatement();
            default: return this.ExpressionStatement()
        }
    }

    /**
     * IfStatement
     *  : 'if' '(' Expression ') Statement;
     *  : 'if' '(' Expression ') Statement 'else' Statement;
     *  ;
     * 
     */
    IfStatement() {
        this._eat('if');
        this._eat('(')
        const test = this.Expression();
        this._eat(')')
        const consequent = this.Statement()

        const alternate = this._lookahead != null && this._lookahead.type === 'else' ?
            this._eat('else') && this.Statement() : null

        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate
        }
    }

    /**
     * VariableStatement
     *  : 'let' VariableDeclarationList ';'
     *  ;
     */
    VariableStatement() {
        this._eat('let');
        const declarations = this.VariableDeclarationList();
        this._eat(';')
        return {
            type: 'VariableStatement',
            declarations
        }
    }

    /**
     * VariableDeclarationList
     *  : VariableDeclaration
     *  | VariableDeclarationList ',' VariableDeclaration
     *  ;
     * 
     */
    VariableDeclarationList() {
        const declarations = [];

        do {
            declarations.push(this.VariableDeclaration())
        } while (this._lookahead.type === ',' && this._eat(','))

        return declarations;
    }

    /**
     * VariableDeclaration
     *     : Identifier OptVariableInitializer
     * ;
     */
    VariableDeclaration() {
        const id = this.Identifier()
        // opt Variable Initializer
        const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' ? this.VariableInitializer() : null
        return {
            type: 'VariableDeclaration',
            id,
            init
        }
    }


    /**
     * VariableInitializer
     *     : SIMPLE_ASSIGN AssignmentExpression    
     */
    VariableInitializer() {
        this._eat('SIMPLE_ASSIGN')
        return this.AssignmentExpression()
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
     *  : LogicalORExpression
     *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *  ;
     */
    AssignmentExpression() {
        const left = this.LogicalORExpression()
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
     * RELATIONAL_OPERATOR: > >= < <=
     */

    /**
     * RelationalExpression
     *  : AdditiveExpression
     *  | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
     */

    RelationalExpression() {
        return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR')
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

    _LogicalExpression(builderName, operatorToken){
        let left = this[builderName]()
        while (this._lookahead.type === operatorToken){
            const operator = this._eat(operatorToken).value;
            const right = this[builderName]()

            left = {
                type: 'LogicalExpression',
                operator,
                left,
                right
            }
        }
        return left
    }

    /**
     * Logical AND expression
     * 
     *  x && y
     * 
     * LogicalANDExpression
     *  : EqualityExpression LOGICAL_AND LogicalANDExpression
     *  | EqualityExpression
     *  ;
     */
     LogicalANDExpression(){
        return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND')
     }

    /**
     * Logical OR expression
     * 
     *  x || y
     * 
     * LogicalORExpression
     *  : LogicalANDExpression LOGICAL_OR LogicalORExpression
     *  | LogicalORExpression
     *  ;
     */
     LogicalORExpression(){
        return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR')
     }

    /**
     * EQUALITY_OPERATOR: ==, !=
     * 
     *  x == y
     *  x != y
     * 
     * EqualityExpression
     *  : RelationalExpression EQUALITY_OPERATOR EqualityExpression
     *  | RelationalExpression
     * ;
     * 
     */
    EqualityExpression() {
        return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR')
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
     * MultiplicativeExpression
     *  : UnaryExpression
     *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR UnaryExpression
     */
    MultiplicativeExpression() {
        return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR')
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
     * UnaryExpression
     *  : LeftHandSideExpression
     *  | ADDITIVE_OPERATOR UnaryExpression
     *  | LOGICAL_NOT UnaryExpression
     *  ;
     */
    UnaryExpression(){
        let operator
        switch (this._lookahead.type){
            case 'ADDITIVE_OPERATOR':
                operator = this._eat('ADDITIVE_OPERATOR').value
                break;
            case 'LOGICAL_NOT':
                operator = this._eat('LOGICAL_NOT').value
                break;
        }
        if (operator != null){
            return {
                type: 'UnaryExpression',
                operator,
                argument: this.UnaryExpression(), // -- allowes chanined unary expression (right side recursion ok, base cases checked first)
            }
        }
        return this.LeftHandSideExpression()
    }


    /**
     * LeftHandSideExpression
     *  
     */
    LeftHandSideExpression(){
        return this.PrimaryExpression()
    }

    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | Identifier
     * ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal()
        }
        switch (this._lookahead.type) {
            case '(': return this.ParenthesizedExpression()
            case 'IDENTIFIER': return this.Identifier()
            default:
                return this.LeftHandSideExpression();
        }
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return (tokenType === 'NUMBER' || 
        tokenType === 'STRING' || 
        tokenType === 'true' || 
        tokenType === 'false' || 
        tokenType == 'null'
        )
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
     *  | BooleanLiteral
     *  | NullLiteral
     *  ;
     */
    Literal() {
        switch (this._lookahead.type) {
            case 'NUMBER': return this.NumericLiteral();
            case 'STRING': return this.StringLiteral();
            case 'true': return this.BooleanLiteral(true);
            case 'false': return this.BooleanLiteral(false);
            case 'null': return this.NullLiteral(false);
        }
        throw new SyntaxError(`Literal: unexpected literal production`)
    }

    /**
     * BooleanLiteral
     *  : 'true'
     *  | 'false'
     *  ;
     */
    BooleanLiteral(value) {
        this._eat(value ? 'true' : 'false')
        return {
            type: 'BooleanLiteral',
            value: value
        }
    }

    /**
     * NullLiteral
     *  : 'true'
     *  | 'false'
     *  ;
     */
    NullLiteral() {
        this._eat('null')
        return {
            type: 'NullLiteral',
            value: null
        }
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