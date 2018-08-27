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
Component(component)
  `
}
