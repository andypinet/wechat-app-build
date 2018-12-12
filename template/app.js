module.exports = {
  bef: `
const regeneratorRuntime = require('./static/runtime.js');
const wxp = require('./static/wx.promise.js').default;
const globalValidate = require('./static/validate.js');
const globalVariable = require('./static/variable.js');
const globalInterface = require('./static/interface.js');
const wxpage = require('./static/wxpage.js');

function createApp(def) {
  let ret = {
    config: {
      route: '/pages/$page'   // $page 会被替换成页面名
    },
    ...def,
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
  wxpage.A(ret)
}

  `
}
