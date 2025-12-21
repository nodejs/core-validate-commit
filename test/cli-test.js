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

  t.test('test stdin with valid JSON', (tt) => {
    const validCommit = {
      id: 'abc123',
      message: 'stream: make null an invalid chunk to write in object mode\n\nthis harmonizes behavior between readable, writable, and transform\nstreams so that they all handle nulls in object mode the same way by\nconsidering them invalid chunks.\n\nPR-URL: https://github.com/nodejs/node/pull/6170\nReviewed-By: James M Snell <jasnell@gmail.com>\nReviewed-By: Matteo Collina <matteo.collina@gmail.com>'
    }
    const input = JSON.stringify([validCommit])

    const ls = spawn('./bin/cmd.js', ['-'])
    let compiledData = ''
    let errorData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.match(compiledData, /abc123/, 'output contains commit id')
      tt.equal(errorData, '', 'no error output')
      tt.end()
    })
  })

  t.test('test stdin with invalid commit (missing subsystem)', (tt) => {
    const invalidCommit = {
      id: 'def456',
      message: 'this is a bad commit message without subsystem\n\nPR-URL: https://github.com/nodejs/node/pull/1234\nReviewed-By: Someone <someone@example.com>'
    }
    const input = JSON.stringify([invalidCommit])

    const ls = spawn('./bin/cmd.js', ['-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.notEqual(code, 0, 'CLI exits with non-zero code on failure')
      tt.match(compiledData, /def456/, 'output contains commit id')
      tt.match(compiledData, /title-format/, 'output mentions the rule violation')
      tt.end()
    })
  })

  t.test('test stdin with multiple commits', (tt) => {
    const commits = [
      {
        id: 'commit1',
        message: 'doc: update README\n\nPR-URL: https://github.com/nodejs/node/pull/1111\nReviewed-By: Someone <someone@example.com>'
      },
      {
        id: 'commit2',
        message: 'test: add new test case\n\nPR-URL: https://github.com/nodejs/node/pull/2222\nReviewed-By: Someone <someone@example.com>'
      }
    ]
    const input = JSON.stringify(commits)

    const ls = spawn('./bin/cmd.js', ['-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.match(compiledData, /commit1/, 'output contains first commit id')
      tt.match(compiledData, /commit2/, 'output contains second commit id')
      tt.end()
    })
  })

  t.test('test stdin with TAP output', (tt) => {
    const validCommit = {
      id: 'tap123',
      message: 'doc: update documentation\n\nPR-URL: https://github.com/nodejs/node/pull/5555\nReviewed-By: Someone <someone@example.com>'
    }
    const input = JSON.stringify([validCommit])

    const ls = spawn('./bin/cmd.js', ['--tap', '-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.match(compiledData, /TAP version 14/, 'output is in TAP format')
      tt.match(compiledData, /# tap123/, 'TAP output contains commit id')
      tt.end()
    })
  })

  t.test('test stdin with invalid JSON', (tt) => {
    const input = 'this is not valid JSON'

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 1, 'CLI exits with non-zero code on error')
      tt.match(errorData, /Error parsing JSON input/, 'error message is shown')
      tt.end()
    })
  })

  t.test('test stdin with non-array JSON', (tt) => {
    const input = JSON.stringify({ id: 'test', message: 'test' })

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 1, 'CLI exits with non-zero code on error')
      tt.match(errorData, /Input must be an array/, 'error message is shown')
      tt.end()
    })
  })

  t.test('test stdin with missing properties', (tt) => {
    const input = JSON.stringify([{ id: 'test' }]) // missing 'message'

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 1, 'CLI exits with non-zero code on error')
      tt.match(errorData, /must have "id" and "message" properties/, 'error message is shown')
      tt.end()
    })
  })

  t.test('test stdin with --no-validate-metadata', (tt) => {
    const commit = {
      id: 'novalidate',
      message: 'doc: update README\n\nThis commit has no PR-URL or reviewers'
    }
    const input = JSON.stringify([commit])

    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code when metadata validation is disabled')
      tt.match(compiledData, /novalidate/, 'output contains commit id')
      tt.end()
    })
  })

  t.end()
})
