import './app.less'

import 'andy-aui/lib/global'

import schema from 'async-validator'

createApp({
  async onShow() {
    console.log(this)
  },
  globalData: {},
  async validate(value, des, cb) {
    var descriptor = des
    var validator = new schema(descriptor)
    validator.validate(value, cb)
  }
})
