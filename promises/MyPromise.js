// @ts-nocheck
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _MyPromise_instances, _MyPromise_thenCbs, _MyPromise_catchCbs, _MyPromise_state, _MyPromise_value, _MyPromise_onSuccessBind, _MyPromise_onFailBind, _MyPromise_runCallbacks, _MyPromise_onSuccess, _MyPromise_onFail;
var STATE = {
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
    PENDING: 'pending'
};
var MyPromise = /** @class */ (function () {
    function MyPromise(cb) {
        _MyPromise_instances.add(this);
        _MyPromise_thenCbs.set(this, []);
        _MyPromise_catchCbs.set(this, []);
        _MyPromise_state.set(this, STATE.PENDING);
        _MyPromise_value.set(this, void 0);
        _MyPromise_onSuccessBind.set(this, __classPrivateFieldGet(this, _MyPromise_instances, "m", _MyPromise_onSuccess).bind(this));
        _MyPromise_onFailBind.set(this, __classPrivateFieldGet(this, _MyPromise_instances, "m", _MyPromise_onFail).bind(this));
        // "every time you create a function it calls the callback you pass to it right away"
        try {
            cb(__classPrivateFieldGet(this, _MyPromise_onSuccessBind, "f"), __classPrivateFieldGet(this, _MyPromise_onFailBind, "f"));
        }
        catch (e) {
            __classPrivateFieldGet(this, _MyPromise_onFailBind, "f").call(this, e);
        }
    }
    MyPromise.prototype.then = function (thenCB, catchCB) {
        var _this = this;
        return new MyPromise(function (resolve, reject) {
            __classPrivateFieldGet(_this, _MyPromise_thenCbs, "f").push(function (result) {
                if (thenCB == null) {
                    resolve(result);
                    return;
                }
                try {
                    resolve(thenCB(result));
                }
                catch (error) {
                    reject(error);
                }
            });
            __classPrivateFieldGet(_this, _MyPromise_catchCbs, "f").push(function (result) {
                if (catchCB == null) {
                    reject(result);
                    return;
                }
                try {
                    resolve(catchCB(result));
                }
                catch (error) {
                    reject(error);
                }
            });
            __classPrivateFieldGet(_this, _MyPromise_instances, "m", _MyPromise_runCallbacks).call(_this);
        });
    };
    MyPromise.prototype["catch"] = function (cb) {
        return this.then(undefined, cb);
    };
    MyPromise.prototype["finally"] = function (cb) {
        return this.then(function (result) {
            cb();
            return result;
        }, function (result) {
            cb();
            throw result;
        });
    };
    MyPromise.resolve = function (value) {
        return new Promise(function (resolve) {
            resolve(value);
        });
    };
    MyPromise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };
    MyPromise.all = function (promises) {
        var results = [];
        var completedPromises = 0;
        return new MyPromise(function (resolve, reject) {
            var _loop_1 = function (i) {
                var promise = promises[i];
                promise.then(function (value) {
                    completedPromises++;
                    result[i] = value;
                    if (completedPromises === promises.length) {
                        resolve(results);
                    }
                })["catch"](reject);
            };
            for (var i = 0; i < promises.length; i++) {
                _loop_1(i);
            }
        });
    };
    return MyPromise;
}());
_MyPromise_thenCbs = new WeakMap(), _MyPromise_catchCbs = new WeakMap(), _MyPromise_state = new WeakMap(), _MyPromise_value = new WeakMap(), _MyPromise_onSuccessBind = new WeakMap(), _MyPromise_onFailBind = new WeakMap(), _MyPromise_instances = new WeakSet(), _MyPromise_runCallbacks = function _MyPromise_runCallbacks() {
    var _this = this;
    if (__classPrivateFieldGet(this, _MyPromise_state, "f") == STATE.FULFILLED) {
        __classPrivateFieldGet(this, _MyPromise_thenCbs, "f").forEach(function (callback) {
            callback(__classPrivateFieldGet(_this, _MyPromise_value, "f")); // what you do wtih the value is up to you. We'll give you a thing at a future time. You instruct us whwat to do with it
        });
        __classPrivateFieldSet(this, _MyPromise_thenCbs, [], "f");
    }
    else if (__classPrivateFieldGet(this, _MyPromise_state, "f") == STATE.REJECTED) {
        __classPrivateFieldGet(this, _MyPromise_catchCbs, "f").forEach(function (callback) {
            callback(__classPrivateFieldGet(_this, _MyPromise_value, "f")); // what you do wtih the value is up to you. We'll give you a thing at a future time. You instruct us whwat to do with it
        });
        __classPrivateFieldSet(this, _MyPromise_catchCbs, [], "f");
    }
}, _MyPromise_onSuccess = function _MyPromise_onSuccess(value) {
    var _this = this;
    queueMicrotask(function () {
        if (__classPrivateFieldGet(_this, _MyPromise_state, "f") !== STATE.PENDING)
            return;
        if (value instanceof MyPromise) {
            value.then(__classPrivateFieldGet(_this, _MyPromise_onSuccessBind, "f"), __classPrivateFieldGet(_this, _MyPromise_onFailBind, "f"));
            return;
        }
        __classPrivateFieldSet(_this, _MyPromise_value, value, "f");
        __classPrivateFieldSet(_this, _MyPromise_state, STATE.FULFILLED, "f");
        __classPrivateFieldGet(_this, _MyPromise_instances, "m", _MyPromise_runCallbacks).call(_this);
    });
}, _MyPromise_onFail = function _MyPromise_onFail(value) {
    var _this = this;
    queueMicrotask(function () {
        if (__classPrivateFieldGet(_this, _MyPromise_state, "f") !== STATE.PENDING)
            return;
        if (value instanceof MyPromise) {
            value.then(__classPrivateFieldGet(_this, _MyPromise_onSuccessBind, "f"), __classPrivateFieldGet(_this, _MyPromise_onFailBind, "f"));
            return;
        }
        if (__classPrivateFieldGet(_this, _MyPromise_catchCbs, "f").length === 0) {
            throw new UncaughtPromiseError(value);
        }
        __classPrivateFieldSet(_this, _MyPromise_value, value, "f");
        __classPrivateFieldSet(_this, _MyPromise_state, STATE.REJECTED, "f");
        __classPrivateFieldGet(_this, _MyPromise_instances, "m", _MyPromise_runCallbacks).call(_this);
    });
};
var UncaughtPromiseError = /** @class */ (function (_super) {
    __extends(UncaughtPromiseError, _super);
    function UncaughtPromiseError(error) {
        var _this = _super.call(this, error) || this;
        _this.stack = "(in promise) ".concat(error.stack);
        return _this;
    }
    return UncaughtPromiseError;
}(Error));
module.exports = MyPromise;
// example
var cb = function () { };
var p = new Promise(cb).then();
