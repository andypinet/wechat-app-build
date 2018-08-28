module.exports = {
  bef: `
const regeneratorRuntime = require('./static/runtime.js');
const wxp = require('./static/wx.promise.js').default;
const globalValidate = require('./static/validate.js');

function createApp(def) {
  let ret = {
    ...def
  }
  ret.onLaunch = function(options) {
    this.$appOptions = {
      ...options
    }
    this.$systemInfo =  wx.getSystemInfoSync()
    def.onLaunch && def.onLaunch.call(this, options)
  }
  ret.onShow = function(options) {
    this.$appOptions = {
      ...this.$appOptions,
      ...options
    }
    def.onShow && def.onShow.call(this, options)
  }
  App(ret)
}

  `
}