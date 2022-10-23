/**
 * Tokenizer spec.
 * 
 */
const Spec = [
    [/^\d+/, 'NUMBER'],
    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING']
]


/**
 * Tokenizer class.
 * Lazily pulls a token from a stream. 
 */
class Tokenizer {

    /**
     * 
     * Initializes the string.
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
            return {
                type: tokenType,
                value: tokenValue
            }
        }

        return null
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