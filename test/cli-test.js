'use strict'

const test = require('tap').test
const { spawn } = require('child_process')

const outputText = `
               assert           async_hooks             benchmark
            bootstrap                buffer                 build
        child_process               cluster               console
            constants                crypto              debugger
                 deps                 dgram                   dns
                  doc                domain                errors
                  esm                   etw                events
                   fs                   gyp                  http
                http2                 https             inspector
            inspector                   lib                loader
                 meta                module                   msi
                n-api                   net                  node
                   os                  path            perf_hooks
              perfctr                policy               process
             punycode           querystring                  quic
             readline                  repl                report
                  src                stream        string_decoder
                  sys                  test                timers
                  tls                 tools          trace_events
                  tty                   url                  util
                   v8                    vm                   win
               worker                  zlib`

test('Test cli flags', (t) => {
  t.test('test list-subsystems', (tt) => {
    const ls = spawn('./bin/cmd.js', ['--list-subsystems'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      tt.equal(compiledData.trim(),
               outputText.trim(),
               'Should output the list to the console')
      tt.end()
    })
  })

  t.end()
})
