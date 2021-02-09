'use strict'

const { test } = require('tap')
const { readFileSync } = require('fs')
const { spawn } = require('child_process')
const subsystems = require('../lib/rules/subsystem')

test('Test cli flags', (t) => {
  t.test('test list-subsystems', (tt) => {
    const ls = spawn('./bin/cmd.js', ['--list-subsystems'], {
      env: { ...process.env, FORCE_COLOR: 0 }
    })
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      // Get the list of subsytems as an Array.
      // Need to match words that also have the "-" in them
      const subsystemsFromOutput = compiledData.match(/[\w'-]+/g)
      const defaultSubsystems = subsystems.defaults.subsystems

      tt.equal(subsystemsFromOutput.length,
        defaultSubsystems.length,
        'Should have the same length')

      // Loop through the output list and compare with the real list
      // to make sure they are all there
      const missing = []
      subsystemsFromOutput.forEach((sub) => {
        if (!defaultSubsystems.find((x) => { return x === sub })) {
          missing.push(sub)
        }
      })

      tt.equal(missing.length, 0, 'Should have no missing subsystems')
      tt.end()
    })
  })

  t.test('test help output', (tt) => {
    const usage = readFileSync('bin/usage.txt', { encoding: 'utf8' })
    const ls = spawn('./bin/cmd.js', ['--help'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      tt.equal(compiledData.trim(),
        usage.trim(),
        '--help output is as expected')
      tt.end()
    })
  })

  t.test('test sha', (tt) => {
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '2b98d02b52'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      tt.match(compiledData.trim(),
        /2b98d02b52/,
        'output is as expected')
      tt.end()
    })
  })

  t.test('test url', (tt) => {
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', 'https://api.github.com/repos/nodejs/core-validate-commit/commits/2b98d02b52'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      tt.match(compiledData.trim(),
        /2b98d02b52/,
        'output is as expected')
      tt.end()
    })
  })

  t.test('test version flag', (tt) => {
    const ls = spawn('./bin/cmd.js', ['--version'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      tt.equal(compiledData.trim(),
        `core-validate-commit v${require('../package.json').version}`,
        'output is equal')
      tt.end()
    })
  })

  t.end()
})
