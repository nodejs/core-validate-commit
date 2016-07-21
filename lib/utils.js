'use strict'

const chalk = require('chalk')
const CHECK = chalk.green('✔')
const X = chalk.red('✖')
const WARN = chalk.yellow('⚠')

exports.CHECK = CHECK
exports.X = X
exports.WARN = WARN

exports.rightPad = function rightPad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${str}${' '.repeat(diff)}`
  }
  return str
}

exports.header = (sha, status) => {
  switch (status) {
    case 'pass':
      return `${CHECK}  ${chalk.underline(sha)}`
    case 'warn':
      return `${WARN}  ${chalk.underline(sha)}`
    case 'error':
      return `${X}  ${chalk.underline(sha)}`
  }
}
