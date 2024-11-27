/**
 *
 * @param fn
 * @param {Number|Object} opt
 * @param mode
 * @returns {retFn}
 * @private
 */
function _throttle_(fn, opt = 1000, mode) {
  let delay, nextTask;
  if (typeof opt === "number") {
    opt = {delay: opt};
  }
  delay                          = opt.delay || 1000;
  let {immediate = true, leave,} = opt || {};
  let timer, t                   = 0, p, pres, prej, args;

  function _fn(ctx) {
    timer = undefined;
    if (nextTask) {
      pres(fn.apply(ctx, args));
      nextTask = undefined;
      pres     = prej = undefined;
    }
    p = undefined;
  }

  function _timer_(ctx) {
    let timestamp = Date.now();
    let timeout   = (timestamp - t - delay) > 0;
    t             = Date.now();
    // console.log("timeout", immediate && timeout);
    if (immediate && timeout) {
      pres(fn.apply(ctx, args));
    } else {
      if (!timeout && leave && mode !== 1) return;
      if (timer && mode === 1) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (!leave) {
        nextTask = true;
      }
      if (!timer && (mode === 1 || nextTask)) {
        // console.log("delay", delay);
        timer = setTimeout(() => _fn(ctx), mode === 1 ? delay : (delay + t - timestamp));
      }
    }
  }

  function retFn() {
    args = arguments;
    !p ? p = new Promise((res, rej) => {
      pres = res;
      prej = rej;
      _timer_(this);
    }) : _timer_(this);
    return p;
  }

  retFn.clear = () => {
    clearTimeout(timer) || (timer = undefined);
    pres = p = undefined;
    prej && prej("$rej$");
    prej = undefined;
    t    = 0;
    return retFn;
  };
  return retFn;
}

/**
 * 限制函数在一定时间间隔内只能执行一次。
 * @param fn
 * @param {object} [opt]
 * @returns {Function}
 */
export function throttle(fn, opt) {
  return _throttle_(fn, opt, 0)
}

/**
 * 在一定时间间隔内，如果函数被多次调用，只执行最后一次调用。
 * @param fn
 * @param {object} [opt]
 * @returns {Function}
 */
export function debounce(fn, opt) {
  if (typeof opt === "number" || !opt) {
    opt = {delay: opt || 1000};
  }
  if (opt.immediate === undefined) opt.immediate = false;
  return _throttle_(fn, opt, 1);
}



