module.exports = {
  bef: `
const app = getApp()
const wxp = require('../../static/wx.promise.js').default
const regeneratorRuntime = require('../../static/runtime.js');
const globalMixins = require('../../static/mixins.js');
`,
  tpl: `
const computedBehavior = require('../../static/computed.behavior.js');
let componentDefine = @{js};
let component = componentDefine.default;
component.data = component.data();
if (!component.behaviors) {
  component.behaviors = []
}
component.behaviors = component.behaviors.concat([computedBehavior])
Component({
  {},
  ...component,
  attached(...args) {
    this.$set = function(...args) {
      if (args.length == 1) {
        this.setData(args[0])
      } else if (args.length == 2) {
        this.setData(args[0], args[1])
      }
    }
    component.attached && component.attached.apply(this, ...args)
  }
})
  `
}
