// const allObserveable = new WeakMap();
import Evt from './evt.js';
const observables = new WeakMap();
const allObservable = {
    objs:new WeakMap(),
    get:function (k){
        let evt = observables.get(k);
        if (!evt) {
            evt=new Evt();
            observables.set(k, evt);
        }
        return evt;
    }
}

function defineProp(obj, k) {
    let observable = allObservable.get(obj);
    let val = obj[k];
    Object.defineProperty(obj, k, {
        get: () => val,
        set: function (v) {
            val = v;
            let evt = observable[obj];
            evt.emit(k, [v, k]);
        },
    });
    observable.keys.add(k);
}

export function observe(obj, k, fn) {
    let keys;
    if (arguments.length === 2) {
        keys = Object.keys(obj);
        fn = k;
    } else {
        keys = [k];
    }
    let evt = allObservable.get(obj);
    keys.forEach((k) => {
        defineProp(obj, k, fn);
    });
    evt.on(k,fn);
    return function unobserve() {
        keys.forEach((k) => observable.evt.off(k, fn));
        observable = null;
    };
}
