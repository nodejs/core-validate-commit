'use strict'

const { test } = require('tap')
const { spawn } = require('child_process')
const subsystems = require('../lib/rules/subsystem')

const cmd = './bin/cmd.js'

test('Test cli flags', (t) => {
  t.test('test list-subsystems', (tt) => {
    const ls = spawn(cmd, ['--list-subsystems'])
    let chunk = ''
    ls.stdout.on('data', (data) => {
      chunk += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    ls.on('close', (code) => {
      // Get the list of subsytems as an Array.
      // Need to match words that also have the "-" in them
      const subsystemsFromOutput = chunk.match(/[\w'-]+/g)
      const defaultSubsystems = subsystems.defaults.subsystems

      tt.equal(subsystemsFromOutput.length,
               defaultSubsystems.length,
               'Should have the same length')

      // Loop through the output list and compare with the real list
      // to make sure they are all there
      const missing = []
      subsystemsFromOutput.forEach((sub) => {
        if (!defaultSubsystems.find((x) => {return x === sub})) {
          missing.push(sub)
        }
      })

      tt.equal(missing.length, 0, 'Should have no missing subsystems')
      tt.end()
    })
  })

  t.end()
})
