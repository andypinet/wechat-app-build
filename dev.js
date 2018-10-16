const child_process = require('child_process')
const chalk = require('chalk')
const log = console.log

let devProcess = child_process.spawn(
  'node',
  ['build.js', '--watch'],
  {}
)

devProcess.stdout.on('data', data => {
  log(chalk.blue(`${data}`))
})

devProcess.stderr.on('data', data => {
  log(chalk.yellow(`${data}`))
})

devProcess.on('close', code => {
  log(chalk.red(`child process exited with code ${code}`))
})

let webpackChildProcess = child_process.spawn(
  'node',
  ['webpack.dev.js'],
  {}
)

webpackChildProcess.stdout.on('data', data => {
  log(chalk.blue(`${data}`))
})

webpackChildProcess.stderr.on('data', data => {
  log(chalk.yellow(`${data}`))
})

webpackChildProcess.on('close', code => {
  log(chalk.red(`child process exited with code ${code}`))
})