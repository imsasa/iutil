import defineModel from "./model.js";
let M   = defineModel(
  [
    {
      name        : "fname",
      alias       : "姓名",
      defaultValue: "sasa",
      required    : true,
      validator   : [function (val) {
        return val.length > 3?true:'长度必须大于3';
      }]
    },
    {
      name        : "flist",
      defaultValue: ["1", "3", "3", "5"],
      isA         : true,
      validator   : function (val) {
        return val.length > 3;
      }
    }]
);
let ins = new M({});

ins.fname = 'ev';

ins.$validate().then(function (ret) {
  console.log('isValid',ins.isValid);
  console.log('validation', ins.$validation);
});
console.log('isModified',ins.isModified);
console.log('$modified', ins.$modified);