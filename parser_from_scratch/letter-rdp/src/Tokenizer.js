/**
 * Tokenizer spec.
 * A regex processor is a state machine. JS abstracts all of this for us but elsewhere we can learn to create one ourselves and learn about automata. 
 * This is the Token Maker, as opposed to the Node Maker
 * 
 */
const Spec = [
    [/^\s+/, null], // ignore whitespace
    [/^\/\/.*/, null], // ignore comments
    [/^\/\*[\s\S]*?\*\//, null], // multi line comments

    // symbols/delimiters:
    [/^;/, ';'],
    [/^{/, '{'],
    [/^}/, '}'],
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^,/, ','],
    [/^\./, '.'],
    [/^\[/, '['],
    [/^\]/, ']'],

    // keywords
    [/^\blet\b/, 'let'],
    [/^\bif\b/, 'if'],
    [/^\belse\b/, 'else'],
    [/^\btrue\b/, 'true'],
    [/^\bfalse\b/, 'false'],
    [/^\bnull\b/, 'null'],
    [/^\bwhile\b/, 'while'],
    [/^\bdo\b/, 'do'],
    [/^\bfor\b/, 'for'],
    [/^\bdef\b/, 'def'],
    [/^\breturn\b/, 'return'],
    [/^\bclass\b/, 'class'],
    [/^\bextends\b/, 'extends'],
    [/^\bsuper\b/, 'super'],
    [/^\bnew\b/, 'new'],
    [/^\bthis\b/, 'this'],


    [/^\d+/, 'NUMBER'], // must be above identifiers

    // identifiers
    [/^\w+/, 'IDENTIFIER'],

    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],

    [/^[=!]=/, 'EQUALITY_OPERATOR'], // must be above assignment operator

    // assignment operators
    [/^=/, 'SIMPLE_ASSIGN'], // must go before additive or multp
    [/^[\*\/\+\-]=/, 'COMPLEX_ASSIGN'],

    // Math operators
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],

    // relational operators
    [/^[><]=?/, 'RELATIONAL_OPERATOR'],

    // logical operators
    [/^&&/, 'LOGICAL_AND'],
    [/^\|\|/, 'LOGICAL_OR'],
    [/^!/, 'LOGICAL_NOT'],



]


/**
 * Tokenizer class.
 * Lazily pulls a token from a stream. 
 */
class Tokenizer {

    /**
     * 
     * Initializes the string. Cursors are critical.
     */
    init(string) {
        this._string = string
        this._cursor = 0
    }

    /**
     * Wither tokenizer hath reached EOF
     */
    isEOF() {
        return this._cursor === this._string.length
    }

    /**
     * Whether we still have more tokens
     */
    hasMoreTokens() {
        return this._cursor < this._string.length
    }

    /**
     * Obtains next token.
     */
    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null
        }

        const string = this._string.slice(this._cursor)

        for (const [regexp, tokenType] of Spec) {
            const tokenValue = this._match(regexp, string)
            if (tokenValue == null){
                continue
            }

            if (tokenType == null){
                return this.getNextToken()
            }

            if (tokenType == 'NUMBER'){
                return {
                    type: tokenType,
                    value: parseFloat(tokenValue)
                }
            }

            return {
                type: tokenType,
                value: tokenValue
            }
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`)
    }

    /**
     * 
     * Matches token for a regular expression 
     */
    _match(regexp, string) {
        const matched = regexp.exec(string)
        if (matched == null) {
            return null
        }
        this._cursor += matched[0].length
        return matched[0]
    }
}


module.exports = {
    Tokenizer
}

// console.log(module)