'use strict'

const id = 'subsystem'

const validSubsystems = [
  'benchmark'
, 'build'
, 'deps'
, 'doc'
, 'lib'
, 'node'
, 'src'
, 'test'
, 'tools'

// core libs
, 'assert'
, 'async_wrap'
, 'buffer'
, 'child_process'
, 'cluster'
, 'console'
, 'constants'
, 'crypto'
, 'debugger'
, 'dgram'
, 'dns'
, 'domain'
, 'events'
, 'fs'
, 'http'
, 'https'
, 'module'
, 'net'
, 'os'
, 'path'
, 'process'
, 'punycode'
, 'querystring'
, 'readline'
, 'repl'
, 'stream'
, 'string_decoder'
, 'sys'
, 'timers'
, 'tls'
, 'tty'
, 'url'
, 'util'
, 'v8'
, 'vm'
, 'zlib'
]

module.exports = {
  id: id
, meta: {
    description: 'enforce subsystem validity'
  , recommended: true
  }
, defaults: {
    subsystems: validSubsystems
  }
, options: {
    subsystems: validSubsystems
  }
, validate: (context, rule) => {
    const subs = rule.options.subsystems
    const parsed = context.toJSON()
    if (!parsed.subsystems.length) {
      if (!parsed.release && !parsed.working) {
        // Missing subsystem
        context.report({
          id: id
        , message: 'Missing subsystem.'
        , string: parsed.title
        , line: 0
        , column: 0
        , level: 'error'
        })
      }
    } else {
      for (const sub of parsed.subsystems) {
        if (!~subs.indexOf(sub)) {
          // invalid subsystem
          const column = parsed.title.indexOf(sub)
          context.report({
            id: id
          , message: `Invalid subsystem: "${sub}".`
          , string: parsed.title
          , line: 0
          , column: column
          , level: 'warning'
          })
        }
      }
    }
  }
}
