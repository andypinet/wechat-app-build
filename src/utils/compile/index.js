const _config = require('../../static/config')

import Flyio from 'andy-flyio/dist/npm/wx'
const flyio = new Flyio()

import { Request } from 'wepyk-api/lib/utils'

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
      duration: 2000
    })
  }
}

export function initRequest() {
  return new CommonRequest(flyio, {
    base: _config.api
  })
}
