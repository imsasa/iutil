
// 判断是否支持EventTarget, 线上发现iOS13.6的部分微信版本不支持
const evts = new WeakMap();
const fns  = new WeakMap();
if (typeof EventTarget === 'undefined') {
    /**
     * @author evan
     * 模拟EventTarget实现一个简单的事件系统
     */
    let listeners = new WeakMap();

    class EventTarget {
        constructor() {
            listeners.set(this, {});
        }

        /**
         * 事件监听
         * @param {string} name 事件名称
         * @param {function} cb 触发的方法
         * @param {boolean} opts 是否只执行一次
         */
        addEventListener(name, cb, opts = {}) {
            let listener = listeners.get(this);
            listener[name] || (listener[name] = []);
            if (listener[name].indexOf(cb) !== -1) return this;
            let _cb = opts['once'] ? (e) => {
                this.removeEventListener(name, _cb);
                cb(e);
            } : cb;
            listener[name].push(_cb);
            return this;
        }

        /**
         * 触发
         * @returns {EventTarget}
         */
        dispatchEvent(e) {
            let len, listener = listeners.get(this);
            let fns = listener[e.type];
            for (len = fns ? fns.length : 0; len--;) {
                fns[len](e);
            }
            return this;
        }

        /**
         * 移除某个订阅
         * @param key
         * @param fn
         * @returns {EventTarget}
         */
        removeEventListener(key, fn) {
            let listener = listeners.get(this);
            const fns = listener[key];
            if (!fns || !fn) {
                return this;
            }
            let fnIdx = fns.indexOf(fn);
            fnIdx>-1 && fns.splice(fnIdx, 1);
            return this;
        }
    }
    globalThis.EventTarget = EventTarget;
}

function Evt() {
    evts.set(this, new EventTarget());
}

Evt.prototype = {
    /**
     * 事件监听
     * @param name 事件名称
     * @param cb 触发的方法
     * @returns {Evt}
     */
    on(name, cb) {
        if(!fns.get(cb)){
            fns.set(cb, e => cb(e.detail, e) );
            evts.get(this).addEventListener(name, fns.get(cb));
        }
        return this;
    },
    /**
     * 事件监听,只执行一次
     * @param name
     * @param cb
     * @returns {Evt}
     */
    once(name, cb) {
        evts.get(this).addEventListener(name, e => cb(e.detail, e), {once: true});
        return this;
    },
    /**
     * 事件移除
     * @param {string}name
     * @param cb
     * @returns {Evt}
     */
    off(name, cb) {
        let fn =fns.get(cb);
        fn && evts.get(this).removeEventListener(name, fn);
        return this;
    },
    /**
     * 事件触发
     * @param {string} name
     * @param info
     * @returns {Evt}
     */
    emit(name, info) {
        evts.get(this).dispatchEvent(new CustomEvent(name, {detail: info}));
        return this;
    },
};

export default Evt;

// demo
// let evt = new Evt();
// let k='foo';
// let fn=function (){
//     console.log('yes')
// }
// evt.on(k,fn);
// evt.on(k,fn);
// evt.emit(k,'a');
