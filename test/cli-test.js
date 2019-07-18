'use strict'

const { test } = require('tap')
const { spawn } = require('child_process')
const subsystems = require('../lib/rules/subsystem')
const rules = require('../lib/rules')
const { promisify } = require('util')
const fs = require('fs')


const readFile = promisify(fs.readFile)


const cmd = './bin/cmd.js'

test('Test cli flags', (t) => {
  t.test('test usage', (tt) => {
    const usage = spawn(cmd, ['--help'])
    let chunk = ''
    usage.stdout.on('data', (data) => {
      chunk += data
    })

    usage.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    usage.on('close', async () => {
      const usageTxt = await readFile(`${process.cwd()}/bin/usage.txt`, 'utf8')
      tt.equal(chunk, usageTxt, 'helps should be equal')
      tt.end()
    })
  })

  t.test('test version', (tt) => {
    const version = spawn(cmd, ['--version'])
    let chunk = ''

    version.stdout.on('data', (data) => {
      chunk += data
    })

    version.stderr.on('data', (data) => {
      tt.fail('this should not happen')
    })

    version.on('close', (code) => {
      tt.equal(chunk.trim(),
               `core-validate-commit v${require('../package.json').version}`,
               'Versions should be equal to the version in the package.json')
      tt.end()
    })

  })

  t.test('test list flag', (tt) => {
    const list = spawn(cmd, ['--list'])
    let chunk = ''
    list.stdout.on('data', (data) => {
      chunk += data
    })

    list.stderr.on('data', (data) => {
      tt.fail('This should not happen')
    })

    list.on('close', (code) => {
      const rulesFromOutput = chunk.trim().split('\n')
      const missing = []
      for (const rule in rules) {
        const filtered = rulesFromOutput.find((x) => {
          return x.trim()
              === `${rules[rule].id} ${rules[rule].meta.description}`
        })

        if (!filtered) {
          missing.push(rule)
        }
      }

      tt.equal(missing.length, 0, 'Should have no missing subsystems')

      tt.end()
    })
  })

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
