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
`,
  tpl: `
const createPage = require('../../static/createpage.js');
import Watch from '../../static/watch';
let watch;
let pageDefine = @{js};
let page = pageDefine.default;
if (!page.data) {
  page.data = function() {
    return {}
  }
}
page.data = page.data();
let _pegeDef = createPage(page)
Page({
  ...{
    watch: {}
  },
  ..._pegeDef,
  ..._pegeDef.methods,
  onLoad(...options) {
    let self = this
    watch = new Watch(this)
    this.$mp = {
      query: options
    }
    this.AUIsetData = this.setData
    this.setComputed = this.setData

    const computed = _pegeDef.computed || {}
    const computedKeys = Object.keys(computed)
    const computedCache = {}

    // 计算 computed
    const calcComputed = (scope) => {
      const needUpdate = {}

      for (let key of computedKeys) {
        const value = computed[key].call(scope) // 计算新值
        if (computedCache[key] !== value) needUpdate[key] = computedCache[key] = value
      }

      return needUpdate
    };

    this.setData = function(opt) {
      let computedData = calcComputed(self)
      let d = {
        ...opt,
        ...computedData
      }

      return watch.setData(d)
    }
    this.$set = function(...args) {
      if (args.length == 1) {
        this.setData(args[0])
      } else if (args.length == 2) {
        this.setData(args[0], args[1])
      }
    }
    this.$emit = this.triggerEvent
    _pegeDef.onLoad && _pegeDef.onLoad.apply(this, ...options)
  }
})
  `
}
