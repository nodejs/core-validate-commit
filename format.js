'use strict'

const chalk = require('chalk')
const diff = require('./diff')
const info = require('./info')

const fail = chalk.red('✖')
const pass = chalk.green('✔')

function line(obj) {
  return obj.lineNum ? obj.lineNum : ''
}

function rpad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${str}${' '.repeat(diff)}`
  }
  return str
}

function lpad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${' '.repeat(diff)}${str}`
  }
  return str
}

function getInfo(s) {
  return rpad(info[s] || '', 40)
}

exports.default = (obj, commit) => {
  const t = chalk.red(obj.code)
  const lin = obj.lineNum
    ? chalk.grey(rpad(`${line(obj)}:0`, 6))
    : rpad('', 6)

  const str = obj.str
  const i = getInfo(obj.code)

  return `  ${fail}  ${lin}  ${i} ${t}`
}

exports.header = (commit) => {
  return `  ${chalk.underline(commit.sha)}`
}

exports.ETITLETOOLONG = (obj, commit) => {
  const t = chalk.red('ETITLETOOLONG')
  const lin = chalk.grey(rpad(`${line(obj)}:50`, 6))
  const str = obj.str
  const l = str.length
  const i = getInfo('ETITLETOOLONG')
  return `  ${fail}  ${lin}  ${i} ${t}
     ${diff.ETITLETOOLONG(str)}`
}

exports.EINVALIDSUBSYSTEM = (obj, commit) => {
  const t = chalk.red('EINVALIDSUBSYSTEM')
  const title = commit.title
  const subs = commit.subsystems.join(',')
  const col = title.indexOf(obj.str)
  const lin = chalk.grey(rpad(`${line(obj)}:${col}`, 6))
  const str = obj.str
  const l = str.length
  const i = getInfo('EINVALIDSUBSYSTEM')
  return `  ${fail}  ${lin}  ${i} ${t}
     ${diff.EINVALIDSUBSYSTEM(str, title)}`
}

exports.ELINETOOLONG = (obj, commit) => {
  const t = chalk.red('ELINETOOLONG')
  const lin = chalk.grey(rpad(`${line(obj)}:72`, 6))
  const str = obj.str
  const l = str.length
  const i = getInfo('ELINETOOLONG')
  return `  ${fail}  ${lin}  ${i} ${t}
     ${diff.ELINETOOLONG(str)}`
}

exports.EMISSINGPRURL = (obj, commit) => {
  const t = chalk.red('EMISSINGPRURL')
  const lin = chalk.grey(rpad('0:0', 6))
  const i = getInfo('EMISSINGPRURL')
  return `  ${fail}  ${lin}  ${i} ${t}`
}

exports.EINVALIDPRURL = (obj, commit) => {
  const t = chalk.red('EINVALIDPRURL')
  const lin = chalk.grey(rpad(`${line(obj)}:7`, 6))
  const i = getInfo('EINVALIDPRURL')
  const str = obj.str
  return `  ${fail}  ${lin}  ${i} ${t}
     ${diff.EINVALIDPRURL(str)}`
}

exports.EINVALIDFIXESURL = (obj, commit) => {
  const t = chalk.red('EINVALIDFIXESURL')
  const lin = chalk.grey(rpad(`${line(obj)}:6`, 6))
  const i = getInfo('EINVALIDFIXESURL')
  const str = obj.str
  return `  ${fail}  ${lin}  ${i} ${t}
     ${diff.EINVALIDFIXESURL(str)}`
}

exports.EMETAORDER = (obj, commit) => {
  const t = chalk.red('EMETAORDER')
  const lin = chalk.grey(rpad(`${line(obj)}:0`, 6))
  const i = getInfo('EMETAORDER')
  const str = obj.str
  return `  ${fail}  ${lin}  ${i} ${t}`
}
