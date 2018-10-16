const config = require('./build.conf')
const webpack = require('webpack')

const log = console.log

let compiler = webpack(config.webpackconfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    // 构建过程出错
    log('webpack error')
  }
  // 成功执行完构建
  log('webpack success', stats.toString())
})