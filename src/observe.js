// const allObserveable = new WeakMap();
const allObservable = {
    objs:new WeakMap(),
    get:function (k){
        let observable = this.objs.get(k);
        if( !observable){
            this.objs.set(k,{evt:new Evt(), keys:new Set()});
            observable = this.objs.get(k);
        }
        return observable;
    }
}

function defineProp(obj, k) {
    let observable = allObservable.get(obj);
    if (observable.keys.has(k)) {
        return ;
    }
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
    let observable = allObservable.get(k);
    keys.forEach((k) => {
        defineProp(obj, k, fn);
    });
    observable.evt.on(k,fn);
    return function unobserve() {
        keys.forEach((k) => observable.evt.off(k, fn));
        observable = null;
    };
}
