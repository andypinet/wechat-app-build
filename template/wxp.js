module.exports = {
  bef: `
const app = getApp()
const wxp = require('../../static/wx.promise.js').default
const regeneratorRuntime = require('../../static/runtime.js');
const globalMixins = require('../../static/mixins.js');
`,
  tpl: `
const createPage = require('../../static/createpage.js');
import Watch from '../../static/watch';
let watch;
let pageDefine = @{js};
let page = pageDefine.default;
page.data = page.data();
let _pegeDef = createPage(page)
Page({
  ...{
    watch: {}
  },
  ..._pegeDef,
  onLoad(...options) {
    let self = this
    watch = new Watch(this)
    this.AUIsetData = this.setData
    this.setComputed = this.setData
    this.setData = function(opt) {
      let d = opt
      const computedProps = _pegeDef.computed
      Object.keys(computedProps).forEach(function(k) {
        d[k] = computedProps[k].bind(self)()
      })
      return watch.setData(d)
    }
    _pegeDef.onLoad && _pegeDef.onLoad.apply(this, ...options)
  }
})
  `
}