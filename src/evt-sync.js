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
    if (listener[name].indexOf(fn) !== -1) return this;
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
  async dispatchEvent(e) {
    let len, listener = listeners.get(this);
    let fns = listener[e.type];
    for (len = fns ? fns.length : 0; len--;) {
       await fns[len](e);
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
export default EventTarget;