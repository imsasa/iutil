export default function createOverLoad(){
    const callMap = new Map()
    function overLoad(...args){
        const key = args.map(arg => typeof arg).join(',')
        // 根据剩余参数的类型 找到再map集合中对应需要处理的函数
        const fn = callMap.get(key);
       return !fn?throw new TypeError('no matching the function'):fn.apply(this, args);
    }

    //addImpl 函数 用来创建一个函数枚举的map
    overLoad.addImpl = function(...args){
        const fn = args.pop()
        if(typeof fn !== 'function') {
            throw new TypeError('not a function')
        }
        callMap.set(args.join(','), fn)
    }
    return overLoad
};
