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
     *  | IterationStatement
     *  | FunctionDeclaration
     *  | ReturnStatement
     *  | ClassDeclaration
     *  ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ';': return this.EmptyStatement();
            case 'if': return this.IfStatement();
            case '{': return this.BlockStatement();
            case 'let': return this.VariableStatement();
            case 'while':
            case 'do':
            case 'for': return this.IterationStatement();
            case 'def': return this.FunctionDeclaration();
            case 'class': return this.ClassDeclaration();
            case 'return': return this.ReturnStatement();
            default: return this.ExpressionStatement()
        }
    }

    /**
     * ClassDeclaration
     *  'class' Identifier OptClassExtends BlockStatement
     *  ;
     */
    ClassDeclaration(){
        this._eat('class')
        const id = this.Identifier();
        const superClass = this._lookahead.type === 'extends' ? this.ClassExtends() : null
        const body = this.BlockStatement()

        return {
            type: 'ClassDeclaration',
            id,
            superClass,
            body
        }
    }

    /**
     * ClassExtends
     *  : 'extends' Identifier
     *  ;
     */
     ClassExtends(){
         this._eat('extends')
         return this.Identifier()
     }


    /**
     * FunctionDeclaration
     *  : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
     */
    FunctionDeclaration() {
        this._eat('def')
        const name = this.Identifier()
        this._eat('(')
        const params = this._lookahead.type !== ')' ? this.FormalParameterList() : []
        this._eat(')')
        const body = this.BlockStatement();

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body
        }

    }

    /**
     * FormalParameterList
     *  : Identifier
     *  | FormalParameterList ',' Identifier
     *  ;
     */
    FormalParameterList() {
        const params = []
        do {
            params.push(this.Identifier())
        } while (this._lookahead.type === ',' && this._eat(','))
        return params
    }

    /**
     * ReturnStatement
     *  : 'return' OptExpression
     *  ;
     */
    ReturnStatement() {
        this._eat('return')
        const argument = this._lookahead.type !== ';' ? this.Expression() : null
        this._eat(';')
        return {
            type: 'ReturnStatement',
            argument
        }
    }

    /**
     * IterationStatement
     *  : WhileStatement
     *  | DoWhileStatement
     *  | ForStatement
     *  ;
     *  
     */
    IterationStatement() {
        switch (this._lookahead.type) {
            case 'while': return this.WhileStatement()
            case 'do': return this.DoWhileStatement()
            case 'for': return this.ForStatement()
        }
    }

    /**
     * WhileStatement
     *  : 'while' '(' Expression ')' Statement
     * ;
     */
    WhileStatement() {
        this._eat('while')
        this._eat('(')
        const test = this.Expression()
        this._eat(')')
        const body = this.Statement()

        return {
            type: 'WhileStatement',
            test,
            body,
        }
    }

    /**
     * DoWhileStatement
     *  : 'while' '(' Expression ')' Statement
     * ;
     */
    DoWhileStatement() {
        this._eat('do')
        const body = this.Statement()
        this._eat('while')
        this._eat('(')
        const test = this.Expression()
        this._eat(')')
        this._eat(';')

        return {
            type: 'DoWhileStatement',
            body,
            test,
        }
    }

    /**
    * ForStatement
    *  : 'For' '(' OptForStatementInit ';' OptExpression ';' OptExpression ')' Statement
    * ;
    */
    ForStatement() {
        this._eat('for')
        this._eat('(')

        const init = this._lookahead.type !== ';' ? this.ForStatementInit() : null
        this._eat(';')

        const test = this._lookahead.type !== ';' ? this.Expression() : null
        this._eat(';')

        const update = this._lookahead.type !== ')' ? this.Expression() : null
        this._eat(')')


        const body = this.Statement()

        return {
            type: 'ForStatement',
            init,
            test,
            update,
            body
        }
    }

    /**
     * ForStatementInit
     *  : VariableStatementInit
     *  ;
     */
    ForStatementInit() {
        if (this._lookahead.type === 'let') {
            return this.VariableStatementInit()
        }
        return this.Expression()
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
     * VariableStatementInit
     *  : 'let' VariableDeclarationList
     *  ;
     */
    VariableStatementInit() {
        this._eat('let')
        const declarations = this.VariableDeclarationList();
        return {
            type: 'VariableStatement',
            declarations
        }
    }

    /**
     * VariableStatement
     *  : 'VariableStatement ';'
     *  ;
     */
    VariableStatement() {
        const variableStatement = this.VariableStatementInit()
        this._eat(';')
        return variableStatement
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
        if (node.type === 'Identifier' || node.type === 'MemberExpression') {
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

    _LogicalExpression(builderName, operatorToken) {
        let left = this[builderName]()
        while (this._lookahead.type === operatorToken) {
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
    LogicalANDExpression() {
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
    LogicalORExpression() {
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
    UnaryExpression() {
        let operator
        switch (this._lookahead.type) {
            case 'ADDITIVE_OPERATOR':
                operator = this._eat('ADDITIVE_OPERATOR').value
                break;
            case 'LOGICAL_NOT':
                operator = this._eat('LOGICAL_NOT').value
                break;
        }
        if (operator != null) {
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
     *  : CallMemberExpression
     *  ;
     */
    LeftHandSideExpression() {
        return this.CallMemberExpression()
    }

    /**
     * CallMemberExpression
     *  : MemberExpression
     *  | CallExpression
     *  ;
     */
    CallMemberExpression(){
        // super call:
        if(this._lookahead.type === 'super'){
            return this._CallExpression(this.Super())
        }

        // Member part, might be part of a call:
        const member = this.MemberExpression()
        if (this._lookahead.type === '('){
            return this._CallExpression(member)
        }
        return member
    }


    /**
     * Generic call expression helper
     *  CallExpression
     *  : Callee arguments
     *  ;
     * 
     *  Callee
     *  : MemberExpression
     *  | CallExpression
     *  ;
     * 
     */
    _CallExpression(callee){
        let callExpression = {
            type: 'CallExpression',
            callee,
            arguments: this.Arguments()
        }

        if (this._lookahead.type === '('){
            callExpression = this._CallExpression(callExpression)
        }
        return callExpression
    }

    /**
     * Arguments
     */
     Arguments(){
        this._eat('(')
        const argumentList = this._lookahead.type !== ')' ? this.ArgumentList() : []
        this._eat(')')
        return argumentList
    
    }
    
    /**
     * ArgumentList
     *  : AssignmentExpression
     *  | ArgumentList ',' AssignmentExpression foo(bar = 2)
     *  
     */
     ArgumentList(){
        const argumentList = []
        do {
            argumentList.push(this.AssignmentExpression())
        } while (this._lookahead.type === ',' && this._eat(','))
        return argumentList
     }


    /**
     * MemberExpression
     *  : PrimaryExpression
     *  : MemberExpression '.' Identifier
     *  : MemberExpression '[' Expression ']'
     *  ;
     */
    MemberExpression() {
        let object = this.PrimaryExpression()

        while (this._lookahead.type === '.' || this._lookahead.type === '[') {
            if (this._lookahead.type === '.') {
                this._eat('.')
                const property = this.Identifier()
                object = {
                    type: 'MemberExpression',
                    computed: false,
                    object,
                    property
                }
            }

            if (this._lookahead.type === '[') {
                this._eat('[')
                const property = this.Expression()
                this._eat(']')
                object = {
                    type: 'MemberExpression',
                    computed: true,
                    object,
                    property
                }
            }
        }
        return object
    }

    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | Identifier
     *  | thisExpression
     * ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal()
        }
        switch (this._lookahead.type) {
            case '(': return this.ParenthesizedExpression()
            case 'IDENTIFIER': return this.Identifier()
            case 'this': return this.ThisExpression()
            case 'new': return this.NewExpression()
            default:
                throw new SyntaxError('Unexpected primary expression')
                // return this.LeftHandSideExpression();
        }
    }

    /**
     *  NewExpression
     *  : 'new' MemberExpression Arguments -> new 
     *  ;
     */
    NewExpression(){
        this._eat('new');
        return {
            type: 'NewExpression',
            callee: this.MemberExpression(),
            arguments: this.Arguments()
        }
    }

    /**
     * ThisExpression
     *  : 'this'
     * ;
     */
     ThisExpression(){
        this._eat('this');
        return {
            type: 'ThisExpression'
        }
     }

     /**
      * Super
      *     : 'super'
      *     ;
      */
     Super(){
        this._eat('super');
        return {
            type: 'Super'
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