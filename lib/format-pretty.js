'use strict'

const chalk = require('chalk')
const utils = require('./utils')

const MAX_LINE_COL_LEN = 6

module.exports = function formatPretty(context, msgs, validator, opts) {
  opts = Object.assign({
    detailed: false
  }, opts)

  if (!msgs.length) {
    console.log(' ', utils.header(context.sha, 'pass'))
    return
  }

  let level = 'warn'
  for (const msg of msgs) {
    if (msg.level === 'error') level = 'error'
  }

  msgs.sort((a, b) => {
    if (a.line === b.line) {
      return a.column < b.column
        ? -1
        : a.column > b.column
        ? 1
        : 0
    }

    return a.line < b.line
      ? -1
      : a.line > b.line
      ? 1
      : 0
  })

  console.log(' ', utils.header(context.sha, level))

  for (const msg of msgs) {
    const ruleId = msg.id
    const rule = validator.rules.get(ruleId)
    if (!rule) {
      throw new Error(`Invalid rule: "${ruleId}"`)
    }

    switch (ruleId) {
      case 'title-length':
      case 'line-length':
        console.log(formatLength(msg, opts))
        break
      default:
        const m = formatDesc(msg.message)
        console.log(formatMessage(msg))
        break
    }
  }
}

function formatLength(msg, opts) {
  const out = formatMessage(msg)
  const str = msg.string
  const l = str.length
  if (!opts.detailed) return out
  const diff = str.slice(0, msg.column) + chalk.red(str.slice(msg.column, l))
  return `${out}
      ${diff}`
}

function formatMessage(msg) {
  const pad = utils.rightPad(`${msg.line}:${msg.column}`, MAX_LINE_COL_LEN)
  const line = chalk.grey(pad)
  const id = formatId(msg.id)
  const m = msg.message
  const icon = msg.level === 'error'
    ? utils.X
    : utils.WARN
  return `     ${icon}  ${line}  ${utils.rightPad(m, 40)} ${id}`
}

function formatId(id) {
  return chalk.red(id)
}

function formatDesc(str) {
  return utils.rightPad(str || '', 40)
}
