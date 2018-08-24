const app = getApp()
const wxp = require('../../static/wx.promise.js').default
const regeneratorRuntime = require('../../static/runtime.js');
const createPage = require('../../static/createpage.js');
const globalMixins = require('../../static/mixins.js');
let js = {};
(function (exports) {
@{js}
})(js);
let page = js.default;
page.data = js.default.data();
Page(createPage(page))