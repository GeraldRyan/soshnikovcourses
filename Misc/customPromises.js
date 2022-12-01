const PENDING = 0
const FULFILLED = 1
const FAILED = 2

function CustomPromise(executor) {


    // Promise implementor decides when
    // Promise instantiator decides what
    let state = PENDING;
    let handlers = [];
    let errHandlers = [];
    let value = null;


    function resolve(result){
        if (state !== PENDING) return;
    
        state = FULFILLED;
        value = result;
        handlers.forEach(h => h(value));
    }



    function then(cb) {
        if (this.state = FULFILLED) {
            cb(this.value)
            return
        }
        else {
            this.handlers.push(cb)
        }
    }

    function catcher(cb) {
        if (this.state = FAILED) {
            cb(this.value)
            return
        }
        else {
            this.errHandlers.push(cb)
        }
    }


}