module.exports = {
  bef: `
const app = getApp()
const wxp = require('../../static/wx.promise.js').default
const regeneratorRuntime = require('../../static/runtime.js');
const globalMixins = require('../../static/mixins.js');
const globalValidate = require('../../static/validate.js');
const globalUtils = require('../../utils/compile/index.js');
const globalVariable = require('../../static/variable.js');
const globalInterface = require('../../static/interface.js');
const wxe = globalUtils.wx;
const globalReg = globalUtils.reg;
`,
  tpl: `
const computedBehavior = require('../../static/computed.behavior.js');
let componentDefine = @{js};
let component = componentDefine.default;
if (!component.data) {
  component.data = function() {
    return {}
  }
}
component.data = component.data();
if (!component.behaviors) {
  component.behaviors = []
}
component.behaviors = component.behaviors.concat([computedBehavior])
component.options = Object.assign({
  addGlobalClass: true,
  multipleSlots: true
}, component.options)
Component({
  ...{},
  ...component,
  attached(...args) {
    this.$set = function(...args) {
      if (args.length == 1) {
        this.setData(args[0])
      } else if (args.length == 2) {
        this.setData(args[0], args[1])
      }
    }
    this.$emit = this.triggerEvent
    this.$back = function(p = {}) {
      if (globalUtils.isNumeric(p)) {
         p = { delta: p }
      }
      if (!p.delta) { p.delta = 1 }
      return wx.navigateBack(p)
    }
    component.attached && component.attached.apply(this, ...args)
  }
})
  `
}
