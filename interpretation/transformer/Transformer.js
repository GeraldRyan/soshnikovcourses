/**
 * AST Transformer
 */
class Transformer{
    /**
     * Translates `def` expression (function declaration) into
     * a variable declaration with a lambda expression
     */
    transformDefToVarLambda(defExp){
        const [_tag, name, params, body] = defExp
        return ['var', name, ['lambda', params, body]]
    }
}

module.exports = Transformer