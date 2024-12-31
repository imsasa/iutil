import arrayProxy from "./.util/array-proxy.js";
import isDiff     from "./.util/is-diff.js";
import singlefy from "../util/singlefy.js";
async function validate(all = false) {
  const ths = this ,validators = this.validator;
  let isValid;
  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];
    let validate_result = await validator.call(ths, this.value);
    // 返回 true或{isValid:true} 表示验证通过,其它值表示验证失败;
    if (typeof validate_result === "object") {
      ths.validation[validator.name] = validate_result.msg;
      validate_result = validate_result.isValid;
    } else {
      ths.validation[validator.name] = validate_result;
      validate_result = validate_result === true;
    }
    if (validate_result !== true) {
      isValid = false;
      if (!all) break;
    } else if (isValid === undefined) {
      isValid = true
    }
  }
  if (ths.isValid !== isValid) {
    ths.isValid = isValid;
    ths["onValidChange"]?.(ths.isValid, ths);
  }
  return ths.isValid;
}

function initValidation(validator) {
  for (let i = 0; i < validator.length; i++) {
    let _validator = validator[i];
    // 其它预定义的验证器也转成方法，如: required, email, phone, url, number, integer, float, min, max, minLength, maxLength, pattern
    if (typeof _validator === 'function' && _validator.name === undefined) {
      _validator['name'] = Math.random().toString(32).substring(2, 8);
    }
  }
}

export default function defineField(name, clsOpt = {}) {
  if (name && (name.__field__ || name.__model__)) return name;
  if (typeof clsOpt === "string" || Array.isArray(clsOpt) || (clsOpt instanceof Date)) {
    clsOpt = {
      defaultValue: clsOpt
    };
  }
  let {
    defaultValue,
    value,
    validator,
    parser, ...otherOpts
  } = clsOpt;
  if (validator && !Array.isArray(validator)) validator = [validator];
  validator || (validator = []);
  const _initValidation = singlefy(() => initValidation(validator));
  for (let i = 0; i < validator.length; i++) {
    let _validator = validator[i];
    // 其它预定义的验证器也转成方法，如: required, email, phone, url, number, integer, float, min, max, minLength, maxLength, pattern
    if (typeof _validator === 'function' && _validator.name === undefined) {
      _validator['name'] = Math.random().toString(32).substring(2, 8);
    }
  }

  class F {
    constructor(value, opts = {}) {
      let ths = this;
      if (value === undefined) {
        value = typeof ths.defaultValue === "function" ? ths.defaultValue() : ths.defaultValue;
      }
      const initVal = ths.parser ? ths.parser(value) : value;
      // initVal = ths.formatter(value);
      if (Array.isArray(initVal)) {
        value = arrayProxy(initVal, setV);
      }

      function setV(val) {
        value          = ths.parser ? ths.parser(val) : val;
        // value          = ths.formatter ? ths.formatter(val) : val;
        let isModified = ths.isModified;
        ths.isModified = isDiff(value, initVal);
        isModified !== ths.isModified && ths["onModifiedChange"]?.(ths.isModified, ths);
      }
      this.isModified = false;
      Object.defineProperty(this, "value", {set: setV, get: () => value, enumerable: true});
      ths.validation = {};
      Object.assign(ths.validation, _initValidation);
    }

    name         = name;
    validate     = validate;
    defaultValue = defaultValue === undefined ? value : defaultValue;
    validator    = validator;
    parser       = parser;
    __field__      = true;
  }

  Object.defineProperty(F, "name", {value: name})
  F._name = name;
  Object.assign(F.prototype, otherOpts);
  return F;
}

// export function defineFields(fieldsCfg = {}, flag) {
//   let fields = [];
//   if (flag) {
//     Object.entries(fieldsCfg).forEach(([k, v]) => fields.push(defineField(k, {defaultValue: v})));
//   } else if (Array.isArray(fieldsCfg)) {
//     fieldsCfg.forEach(i => fields.push(defineField(i.name, i)));
//   } else {
//     Object.entries(fieldsCfg).forEach(([k, cfg]) => {
//       if (typeof cfg === 'string' || Array.isArray(cfg) || (cfg instanceof Date)) {
//         cfg = {defaultValue: cfg};
//       }
//       fields.push(defineField(k, cfg));
//     });
//   }
//   return fields;
// }