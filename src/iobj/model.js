import defineField from "./field.js";
let fieldModifiedChangeHandler = function (val, f) {
  let ths = this;
  let isModified = ths.isModified;
  const modified = ths.$modified;
  modified[f.name] = val;
  if (val === false && isModified) {
    ths.isModified = Object.values(modified).some((v) => v === true);
  } else if (isModified === false) {
    ths.isModified = true;
  }
};

let fieldValidChangeHandler  = function (val, f) {
  let ths = this;
  let isValid      = ths.isValid;
  const validation = ths.$validation;
  if(typeof val === "boolean"){
    val = {isValid:val};
  }
  // validation[f.name] = val;
  if (val.isValid === true && !isValid) {
    ths.isValid = !Object.values(validation).some(v => v !== true);
  } else if (isValid === true) {
    ths.isValid = val.isValid;
  } else {
    ths.isValid = false;
  }
  if (ths.isValid !== isValid) {
    // 触发
  }
};
function init($fields, $data = {}, ths) {
  const fields                   = {};
  const validation               = ths.$validation;
  const modified                 = ths.$modified;
  for (let Field of $fields) {
    let val, fieldName, field, get, set;
    fieldName              = Field.name;
    validation[fieldName]  = undefined;
    modified[fieldName]    = false;
    val                    = $data[fieldName];
    field                  = new Field(val);
    get                    = () => field.value;
    set                    = (val) => field.value = val;
    field.onModifiedChange = fieldModifiedChangeHandler.bind(ths);
    field.onValidChange    = fieldValidChangeHandler.bind(ths);
    Object.defineProperty(ths, field.name, {get, set, enumerable: true});
    fields[field.name] = field;
  }
  return fields;
}

function $validate() {
  let ths  = this, fields = Object.values(ths.$fields), varr   = [];
  for (let field of fields) {
    if (field.isValid !== undefined)continue;
    varr.push(field.validate());
  }
  return Promise.all(varr).then(() => ths.isValid);
}
function defineFields(fieldsCfg = {}, flag) {
  let fields = [];
  const _defineField = (name, cfg) => {
    const f = (cfg.__field__ || cfg.__model__) ? cfg : defineField(name || cfg.name, cfg);
    fields.push(f);
  };
  if (Array.isArray(fieldsCfg)) {
    fieldsCfg.forEach(i => _defineField(undefined,i));
  } else {
    Object.entries(fieldsCfg).forEach(([k, cfg]) => {
      if (flag || typeof cfg === 'string' || Array.isArray(cfg) || (cfg instanceof Date)) {
        cfg = {defaultValue: cfg};
      }
      fields.push(_defineField(k, cfg));
    });
  }
  return fields;
}
/**
 *
 * @param {String||Object} [name]
 * @param fields
 * @return {Model}
 */
export default function defineModel(name, fields) {
  if (typeof name === 'object') {
    fields = name;
    name   = undefined;
  }
  class _ extends Model {
    constructor(obj) {
      super(obj);
    }
    $name          = name;
    static fields = defineFields(fields);
  }
  return _;
}
export class Model {
  constructor(data = {}) {
    this.$validation = {};
    this.$modified   = {};
    this.isModified  = false;
    this.isValid     = undefined;
    let $fields      = this.constructor.fields;
    if (!$fields) {
      $fields = defineFields(data);
      data    = {};
    }
    this.$fields = init($fields, data, this);
  }
  set(k, v) {
    this[k] = v;
    return this;
  }
  $validate      = $validate;
  __model__      = true;
}
