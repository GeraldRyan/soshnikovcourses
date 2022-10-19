const assert = require('assert')
const {test} = require('./test-utils')

module.exports = function(eva) {

    test(eva, 
    `
        (class Point null
            (begin
            
                (def constructor (this x y)
                    (begin
                        (set (prop this x) x)    
                        (set (prop this y) y)    
                    )
                )

                (def calc (this)
                
                        (+ (prop this x) (prop this y) )
                )
            )
        )

        (var p (new Point 10 20 ))
        ((prop p calc) p)
    `
    , 30)
    console.log('eva global')
    console.log(eva.global)
    test(eva,
    `
    (class Point3D Point
        (begin
        
            (def constructor (this x y z)
                (begin
                    ((prop (super Point3D) constructor) this x y)
                    (set (prop this z) z)    
                )
            )

            (def calc (this)

                    (
                        + 
                        ((prop (super Point3D) calc) this) 
                        (prop this z) 
                    )
            )

            (def uniqueMethod (this)
                (begin
                    (set (prop this t) m)
                )    
                
                
                
            )

        )
    )

    (var p (new Point3D 10 20 30))
    ((prop p calc) p)
    `,
    60)
    
}