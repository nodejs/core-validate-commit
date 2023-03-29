import chalk from 'chalk'
import * as utils from './utils.js'

const MAX_LINE_COL_LEN = 6

export default function formatPretty (context, msgs, validator, opts) {
  opts = Object.assign({
    detailed: false
  }, opts)

  if (!msgs.length) {
    console.log(' ', utils.header(context.sha, 'pass'))
    return
  }

  let level = 'pass'
  for (const msg of msgs) {
    if (msg.level === 'fail') level = 'fail'
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
        console.log(formatMessage(msg))
        break
    }
  }
}

function formatLength (msg, opts) {
  const out = formatMessage(msg)
  const str = msg.string
  const l = str.length
  if (!opts.detailed) return out
  const col = msg.column || 0
  const diff = str.slice(0, col) + chalk.red(str.slice(col, l))
  return `${out}
      ${diff}`
}

function formatMessage (msg) {
  const l = msg.line || 0
  const col = msg.column || 0
  const pad = utils.rightPad(`${l}:${col}`, MAX_LINE_COL_LEN)
  const line = chalk.grey(pad)
  const id = formatId(msg.id)
  const m = msg.message
  const icon = msg.level === 'fail'
    ? utils.X
    : msg.level === 'warn'
      ? utils.WARN
      : utils.CHECK
  return `     ${icon}  ${line}  ${utils.rightPad(m, 40)} ${id}`
}

function formatId (id) {
  return chalk.red(id)
}
