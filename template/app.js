module.exports = {
  bef: `
const regeneratorRuntime = require('./static/runtime.js');
const wxp = require('./static/wx.promise.js').default;

function createApp(def) {
  let ret = {
    ...def
  }
  ret.$appOptions = {}
  ret.onLaunch = function(options) {
    def.onLaunch && def.onLaunch.call(this, options)
  }
  ret.onShow = function(options) {
    this.$appOptions = {
      ...ret.$appOptions,
      ...options
    }
    def.onShow && def.onShow.call(this, options)
  }
  App(ret)
}
  `
}