import Evt from './evt.js';
const observables = new WeakMap();
function defineProp(obj, k, evt) {
    let val = obj[k];
    Object.defineProperty(obj, k, {
        get: () => val,
        set: function (v) {
            if(val===v) return ;
            val = v;
            evt?.emit('change', [v, k]);
        },
    });
}

export function observe(obj, fn, deep) {
    let cache = observables.get(obj);
    let uns=[];
    if (!cache?.evt) {
        const fns = new WeakMap();
        let evt = new Evt();
        cache = {evt, fns};
        observables.set(obj, cache);
        let keys = Object.keys(obj);
        keys.forEach(k => {
            defineProp(obj, k, evt);
            if (deep && typeof obj[k] === 'object') {
               uns.push(observe(obj[k], fn, k));
            }
        });
    }
    if(cache.fns.get(fn)) return ;
    const {evt, fns} = observables.get(obj);
    let _ = typeof deep === 'string' ? arg => fn(arg[0], `${deep}.${arg[1]}`, obj) : arg => fn(arg[0], arg[1], obj);
    fns.set(fn, _);
    evt.on('change', _);
    return function unobserve() {
        evt.off('change', _);
        uns.forEach(u=>u());
    };
}

// demo
// let obj={name:'sasa',age:30, sub:{n:'n'}};
// observe(obj,(arg,key)=>{
//     console.log(arg);
// },true)
// observe(obj.sub,(arg,key)=>{
//     console.log(arg);
// },true)
// obj.sub.n='evan';