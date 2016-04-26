'use strict'

const chalk = require('chalk')

exports.ETITLETOOLONG = (str) => {
  const l = str.length
  return str.slice(0, 50) + chalk.red(str.slice(50, l))
}

exports.EINVALIDSUBSYSTEM = (sub, title) => {
  const l = title.length
  const idx = title.indexOf(sub)
  const len = sub.length
  const str = title
  const end = len + idx
  return str.slice(0, idx) + chalk.red(str.slice(idx, end)) + str.slice(end, l)
}

exports.ELINETOOLONG = (str) => {
  const l = str.length
  return str.slice(0, 72) + chalk.red(str.slice(72, l))
}

exports.EINVALIDPRURL = (str) => {
  return str.slice(0, 7) + chalk.red(str.slice(7, str.length))
}

exports.EINVALIDFIXESURL = (str) => {
  return str.slice(0, 6) + chalk.red(str.slice(6, str.length))
}
