'use strict'

const tap = require('tap')

module.exports = function formatTap(context, msgs, validator, cb) {
  tap.test(context.sha, (t) => {
    for (const m of msgs) {
      switch (m.level) {
        case 'pass':
          const a = m.string
            ? ` [${m.string}]`
            : ''
          t.pass(`${m.id}: ${m.message}${a}`)
          break
        case 'skip':
          t.pass(`${m.id}: ${m.message}`, {
            skip: true
          })
          break
        case 'fail':
          onFail(context, m, validator, t)
          break
      }
    }

    t.end()
  })

  tap.on('end', cb)
}

function onFail(context, m, validator, t) {
  switch (m.id) {
    case 'line-length':
    case 'title-length':
      lengthFail(context, m, validator, t)
      break
    case 'subsystem':
      subsystemFail(context, m, validator, t)
      break
    default:
      defaultFail(context, m, validator, t)
      break
  }
}

function lengthFail(context, m, validator, t) {
  const body = m.id === 'title-length'
    ? context.title
    : context.body
  t.fail(`${m.id}: ${m.message}`, {
    found: m.string.length
  , compare: '<='
  , wanted: m.maxLength
  , at: {
      line: m.line || 0
    , column: m.column || 0
    , file: body
    , function: ''
    }
  })
}

function subsystemFail(context, m, validator, t) {
  t.fail(`${m.id}: ${m.message} (${m.string})`, {
    found: m.string
  , compare: 'indexOf() !== -1'
  , wanted: m.wanted || ''
  , at: {
      line: m.line || 0
    , column: m.column || 0
    , file: context.title
    , function: ''
    }
  })
}

function defaultFail(context, m, validator, t) {
  const body = m.id === 'subsystem'
    ? context.title
    : context.body
  t.fail(`${m.id}: ${m.message} (${m.string})`, {
    found: m.string
  , compare: Array.isArray(m.wanted) ? 'indexOf() !== -1' : '==='
  , wanted: m.wanted || ''
  , at: {
      line: m.line || 0
    , column: m.column || 0
    , file: context.description
    , function: ''
    }
  })
}
