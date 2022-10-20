/**
 * Letter parseArgs: recursive descent implmenentation
 */

class Parser {
    /**
     * Parses a string into an AST
     */
    parse(string){
        this._string = string

        // Parse recursively starting from main entry point, the Program:

        return this.Program()
    }

    /**
     * Main entry point
     * 
     * Program
     *  : NumericLiteral
     */
    Program() {
        return this.NumericLiteral()
    }

    /**
     *  NumericLiteral
     *  : NUMBER
     *  ;
     */
    NumericLiteral(){
        return {
            type: 'NumericLiteral',
            value: Number(this._string),
        }
    }
}

module.exports = {
    Parser
}