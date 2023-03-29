import { test } from 'tap'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import subsystems from '../lib/rules/subsystem.js'

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

  t.test('test tap output', (tt) => {
    // Use a commit from this repository that does not follow the guidelines.
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '--tap', '69435db261'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      tt.fail(`Unexpected stderr output ${data.toString()}`)
    })

    ls.on('close', (code) => {
      const output = compiledData.trim()
      tt.match(output,
        /# 69435db261/,
        'TAP output contains the sha of the commit being linted')
      tt.match(output,
        /not ok \d+ subsystem: Invalid subsystem: "chore" \(chore: update tested node release lines \(#94\)\)/,
        'TAP output contains failure for subsystem')
      tt.match(output,
        /# fail\s+\d+/,
        'TAP output contains total failures')
      tt.match(output,
        /# Please review the commit message guidelines:\s# https:\/\/github.com\/nodejs\/node\/blob\/HEAD\/doc\/contributing\/pull-requests.md#commit-message-guidelines/,
        'TAP output contains pointer to commit message guidelines')
      tt.equal(code, 1, 'CLI exits with non-zero code on failure')
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

    ls.on('close', async (code) => {
      const pkgJsonPath = new URL('../package.json', import.meta.url)
      const pkgJson = readFileSync(pkgJsonPath, { encoding: 'utf8' })
      const { version } = JSON.parse(pkgJson)
      tt.equal(compiledData.trim(),
        `core-validate-commit v${version}`,
        'output is equal')
      tt.end()
    })
  })

  t.end()
})
