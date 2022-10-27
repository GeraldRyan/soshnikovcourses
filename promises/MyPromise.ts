// @ts-nocheck


const STATE = {
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
    PENDING: 'pending'
}

class MyPromise {
    #thenCbs: any[] = []
    #catchCbs: any[] = []
    #state = STATE.PENDING
    #value
    #onSuccessBind = this.#onSuccess.bind(this)
    #onFailBind = this.#onFail.bind(this)

    constructor(cb: (a: any, b: any) => any) {
        // "every time you create a function it calls the callback you pass to it right away"
        try {
            cb(this.#onSuccessBind, this.#onFailBind)
        }
        catch (e) { this.#onFailBind(e) }
    }

    #runCallbacks() {
        if (this.#state == STATE.FULFILLED) {
            this.#thenCbs.forEach(callback => {
                callback(this.#value) // what you do wtih the value is up to you. We'll give you a thing at a future time. You instruct us whwat to do with it
            })
            this.#thenCbs = []
        }
        else if (this.#state == STATE.REJECTED) {
            this.#catchCbs.forEach(callback => {
                callback(this.#value) // what you do wtih the value is up to you. We'll give you a thing at a future time. You instruct us whwat to do with it
            })
            this.#catchCbs = []
        }
    }

    #onSuccess(value: any) {
        queueMicrotask(() => {

            if (this.#state !== STATE.PENDING) return

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind)
                return
            }

            this.#value = value
            this.#state = STATE.FULFILLED
            this.#runCallbacks()

        })
    }
    #onFail(value: any) {
        queueMicrotask(() => {


            if (this.#state !== STATE.PENDING) return
            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind)
                return
            }

            if (this.#catchCbs.length === 0) {
                throw new UncaughtPromiseError(value)
            }
            this.#value = value
            this.#state = STATE.REJECTED
            this.#runCallbacks()
        })

    }

    then(thenCB: ((...args: any[]) => any) | undefined, catchCB: ((...args: any[]) => any) | undefined) {
        return new MyPromise((resolve, reject) => {
            this.#thenCbs.push(result => {
                if (thenCB == null) {
                    resolve(result)
                    return
                }
                try {
                    resolve(thenCB(result))
                }
                catch (error) {
                    reject(error)
                }
            })

            this.#catchCbs.push(result => {
                if (catchCB == null) {
                    reject(result)
                    return
                }
                try {
                    resolve(catchCB(result))
                }
                catch (error) {
                    reject(error)
                }
            })


            this.#runCallbacks()
        })
    }

    catch(cb: (...args: any[]) => any) {
        return this.then(undefined, cb)
    }

    finally(cb: (...args: any[]) => any) {
        return this.then(result => {
            cb()
            return result
        }, result => {
            cb()
            throw result
        })
    }

    static resolve(value){
        return new Promise((resolve) =>{
            resolve(value)
        })
    }
    static reject(value){
        return new Promise((resolve, reject) =>{
            reject(value)
        })
    }

    static all(promises){
        const results = []
        let completedPromises = 0
        return new MyPromise((resolve, reject)=>{
            for (let i = 0; i < promises.length; i++){
                const promise = promises[i]
                promise.then(value =>{
                    completedPromises++
                    result[i] = value
                    if (completedPromises === promises.length){
                        resolve(results)
                    }
                }).catch(reject)
            }
        })
    }

}

class UncaughtPromiseError extends Error {
    constructor(error){
        super(error)
        this.stack = `(in promise) ${error.stack}`
    }

}

module.exports = MyPromise

// example
let cb = () => { }
const p = new Promise(cb).then()