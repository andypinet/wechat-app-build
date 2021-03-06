const _config = require('../../static/config')
const _variable = require('../../static/variable')
const _interface = require('../../static/interface')
const wxp = require('../../static/wx.promise').default

import Flyio from 'andy-flyio/dist/npm/wx'

const flyio = new Flyio()

import {Request} from 'wepyk-api/lib/utils'

export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

class CommonRequest extends Request {
  constructor(...args) {
    super(...args)
    this.navigationBarLoading = false
    // this._debug = true;
  }

  async get(...args) {
    if (this.navigationBarLoading) {
      wx.showNavigationBarLoading()
    }
    wx.showLoading()
    try {
      let res = await super.get(...args)
      let err = new Error('服务器返回错误')
      if (!res.data.code || res.data.code > 20000) {
        throw err
      }
      if (this.navigationBarLoading) {
        wx.hideNavigationBarLoading()
      }
      wx.hideLoading()
      return res.data.data
    } catch (err) {
      this.handleErr(err)
    }
  }

  handleErr(err) {
    console.error(err)
    wx.showToast({
      title: '服务器返回错误',
      icon: 'none',
      duration: 2000,
    })
  }
}

export function initRequest() {
  return new CommonRequest(flyio, {
    base: _config.api,
  })
}

let _wx = {}

/**
 * 检测某个setting是否授权过
 *
 * @param key
 * @returns {Promise<any>}
 */
_wx.checkSetting = function (key) {
  return new Promise(resolve => {
    wxp.getSetting().then(res => {
      let ret = res.authSetting[_variable.AuthSetting[key]]
      resolve({
        detail: ret
      })
    })
  })
}

/**
 * showToast
 *
 * @param title
 * @param icon
 * @param d
 */
_wx.showToast = function (title, icon = 'none', d = {}) {
  let opt = {
    title,
    icon,
    duration: 2000
  }
  wx.showToast({
    ...opt,
    ...d
  })
}

export let wx = _wx

let _reg = {}
_reg.stringType = function(opt) {
  let d = {
    type: "string",
    required: true
  }
  return {
    ...d,
    ...opt
  }
}
_reg.isOnlyHasNum = function (message = 'only can has num') {
  return {
    pattern: /^[0-9]+$/,
    message: 'only can has num ',
  }
}
_reg.isPhone = function (message = 'invalid phone') {
  return [
    _reg.isOnlyHasNum(),
    {
      len: 11,
      message
    },
  ]
}

export let reg = _reg


