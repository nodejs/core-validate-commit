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

exports.leftPad = function leftPad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${' '.repeat(diff)}${str}`
  }
  return str
}

exports.header = (sha, status) => {
  switch (status) {
    case 'skip':
    case 'pass':
      const suffix = status === 'skip'
        ? ' # SKIPPED'
        : ''
      return `${CHECK}  ${chalk.underline(sha)}${suffix}`
    case 'fail':
      return `${X}  ${chalk.underline(sha)}`
  }
}

exports.describeRule = function describeRule(rule, max = 20) {
  if (rule.meta && rule.meta.description) {
    const desc = rule.meta.description
    const title = exports.leftPad(rule.id, max)
    console.log(' %s %s', chalk.red(title), chalk.dim(desc))
  }
}

exports.describeSubsystem = function describeSubsystem(subsystems, max = 20) {
  if (subsystems) {
    for (let sub = 0; sub < subsystems.length; sub = sub + 3) {
      console.log('%s %s %s',
                  chalk.green(exports.leftPad(subsystems[sub] || '', max)),
                  chalk.green(exports.leftPad(subsystems[sub + 1] || '', max)),
                  chalk.green(exports.leftPad(subsystems[sub + 2] || '', max))
      )
    }
  }
}
