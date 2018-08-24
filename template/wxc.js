const app = getApp()
const wxp = require('../../static/wx.promise.js').default
const regeneratorRuntime = require('../../static/runtime.js');
const computedBehavior = require('../../static/computed.behavior.js');
let js = {};
(function (exports) {
@{js}
})(js);
let componentDefine = js.default;
componentDefine.data = js.default.data();
if (!componentDefine.behaviors) {
  componentDefine.behaviors = []
}
componentDefine.behaviors = componentDefine.behaviors.concat([computedBehavior])
Component(componentDefine)