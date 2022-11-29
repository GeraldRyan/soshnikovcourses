const PENDING = 0
const FULFILLED = 1
const FAILED = 2

class CustomPromise{

    constructor(resolve, reject){
        // Promise implementor decides when
        // Promise instantiator decides what
        this.state = PENDING
        this.handlers = []
        this.errHandlers = []
        this.value = ''
    }



    then(cb){
        if (this.state = FULFILLED){
            cb(this.value)
            return
        }
        else {
            this.handlers.push(cb)
        }
    }

    catch(cb){
        if (this.state = FAILED){
            cb(this.value)
            return
        }
        else {
            this.errHandlers.push(cb)
        }
    }


}