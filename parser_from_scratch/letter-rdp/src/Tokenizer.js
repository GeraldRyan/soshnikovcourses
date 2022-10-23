/**
 * Tokenizer class.
 * Lazily pulls a token from a stream. 
 */
class Tokenizer {
    
    /**
     * 
     * Initializes the string.
     */
    init(string){
        this._string = string
        this._cursor = 0
    }

    /**
     * Wither tokenizer hath reached EOF
     */
    isEOF(){
        return this._cursor === this._string.length
    }

    /**
     * Whether we still have more tokens
     */
    hasMoreTokens(){
        return this._cursor < this._string.length
    }

    /**
     * Obtains next token.
     */
    getNextToken(){
        if (!this.hasMoreTokens()){
            return null
        }

        const string = this._string.slice(this._cursor)

        // Numbers: \d+
        let matched =  /^\d+/.exec(string)
        if (matched !== null){
            this._cursor += matched[0].length
            return {
                type: 'NUMBER',
                value: matched[0]
            }
        }

        // String (double quotes):
        matched = /^"[^"]*"/.exec(string)
        if (matched !== null){
            this._cursor += matched[0].length
            return {
                type: 'STRING',
                value: matched[0],
            }
        }

        // String (single quotes):
        matched = /^'[^']*'/.exec(string)
        if (matched !== null){
            this._cursor += matched[0].length
            return {
                type: 'STRING',
                value: matched[0],
            }
        }
        return null
    }
}



module.exports = {
    Tokenizer
}

// console.log(module)