export default function createOverLoad() {
  let defaultFn;
  const callMap = new Map();
  const overLoad = function (... args) {
    const key = args.map(arg => typeof arg).join(',');
    // 根据参数的类型找到map集合中对应需要处理的函数
    const fn = callMap.get(key) || defaultFn;
    return fn.apply(this, args);
  };
  // addImpl用来创建一个函数枚举的map
  overLoad.addImpl = function (... args) {
    const fn = args.pop();
    if (typeof fn !== 'function') {
      throw new TypeError('not a function');
    }
    defaultFn || (defaultFn = fn);
    callMap.set(args.join(','), fn);
  };
  return overLoad;
};
