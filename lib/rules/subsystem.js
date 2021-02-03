'use strict'

const id = 'subsystem'

const validSubsystems = [
  'benchmark',
  'build',
  'bootstrap',
  'cli',
  'deps',
  'doc',
  'errors',
  'etw',
  'esm',
  'gyp',
  'inspector',
  'lib',
  'loader',
  'meta',
  'msi',
  'node',
  'node-api',
  'perfctr',
  'policy',
  'src',
  'test',
  'tools',
  'wasm',
  'win',

  // core libs
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'debugger',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'quic',
  'readline',
  'repl',
  'report',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker',
  'zlib'
]

module.exports = {
  id: id,
  meta: {
    description: 'enforce subsystem validity',
    recommended: true
  },
  defaults: {
    subsystems: validSubsystems
  },
  options: {
    subsystems: validSubsystems
  },
  validate: (context, rule) => {
    const subs = rule.options.subsystems
    const parsed = context.toJSON()
    if (!parsed.subsystems.length) {
      if (!parsed.release && !parsed.working) {
        // Missing subsystem
        context.report({
          id: id,
          message: 'Missing subsystem.',
          string: parsed.title,
          line: 0,
          column: 0,
          level: 'fail',
          wanted: subs
        })
      } else {
        context.report({
          id: id,
          message: 'Release commits do not have subsystems',
          string: '',
          level: 'skip'
        })
      }
    } else {
      let failed = false
      for (const sub of parsed.subsystems) {
        if (!~subs.indexOf(sub)) {
          failed = true
          // invalid subsystem
          const column = parsed.title.indexOf(sub)
          context.report({
            id: id,
            message: `Invalid subsystem: "${sub}"`,
            string: parsed.title,
            line: 0,
            column: column,
            level: 'fail',
            wanted: subs
          })
        }
      }

      if (!failed) {
        context.report({
          id: id,
          message: 'valid subsystems',
          string: parsed.subsystems.join(','),
          level: 'pass'
        })
      }
    }
  }
}
