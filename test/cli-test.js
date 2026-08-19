import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import subsystems from '../lib/rules/subsystem.js'

function waitForClose (child, callback) {
  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', async (code) => {
      try {
        await callback(code)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

describe('Test cli flags', () => {
  test('test list-subsystems', async (t) => {
    const ls = spawn('./bin/cmd.js', ['--list-subsystems'], {
      env: { ...process.env, FORCE_COLOR: 0 }
    })
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail('This should not happen')
    })

    await waitForClose(ls, (code) => {
      // Get the list of subsytems as an Array.
      // Need to match words that also have the "-" in them
      const subsystemsFromOutput = compiledData.match(/[\w'-]+/g)
      const defaultSubsystems = subsystems.defaults.subsystems

      t.assert.strictEqual(subsystemsFromOutput.length,
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

      t.assert.strictEqual(missing.length, 0, 'Should have no missing subsystems')
    })
  })

  test('test help output', async (t) => {
    const usage = readFileSync('bin/usage.txt', { encoding: 'utf8' })
    const ls = spawn('./bin/cmd.js', ['--help'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail('This should not happen')
    })

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(compiledData.trim(),
        usage.trim(),
        '--help output is as expected')
    })
  })

  test('test sha', async (t) => {
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '2b98d02b52'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail('This should not happen')
    })

    await waitForClose(ls, (code) => {
      t.assert.match(compiledData.trim(),
        /2b98d02b52/,
        'output is as expected')
    })
  })

  test('test tap output', async (t) => {
    // Use a commit from this repository that does not follow the guidelines.
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '--tap', '69435db261'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail(`Unexpected stderr output ${data.toString()}`)
    })

    await waitForClose(ls, (code) => {
      const output = compiledData.trim()
      t.assert.match(output,
        /# 69435db261/,
        'TAP output contains the sha of the commit being linted')
      t.assert.match(output,
        /not ok \d+ subsystem: Invalid subsystem: "chore" \(chore: update tested node release lines \(#94\)\)/,
        'TAP output contains failure for subsystem')
      t.assert.match(output,
        /# fail\s+\d+/,
        'TAP output contains total failures')
      t.assert.match(output,
        /# Please review the commit message guidelines:\s# https:\/\/github.com\/nodejs\/node\/blob\/HEAD\/doc\/contributing\/pull-requests.md#commit-message-guidelines/,
        'TAP output contains pointer to commit message guidelines')
      t.assert.strictEqual(code, 1, 'CLI exits with non-zero code on failure')
    })
  })

  test('test url', async (t) => {
    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', 'https://api.github.com/repos/nodejs/core-validate-commit/commits/2b98d02b52'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail('This should not happen')
    })

    await waitForClose(ls, (code) => {
      t.assert.match(compiledData.trim(),
        /2b98d02b52/,
        'output is as expected')
    })
  })

  test('test version flag', async (t) => {
    const ls = spawn('./bin/cmd.js', ['--version'])
    let compiledData = ''
    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      t.assert.fail('This should not happen')
    })

    await waitForClose(ls, async (code) => {
      const pkgJsonPath = new URL('../package.json', import.meta.url)
      const pkgJson = readFileSync(pkgJsonPath, { encoding: 'utf8' })
      const { version } = JSON.parse(pkgJson)
      t.assert.strictEqual(compiledData.trim(),
        `core-validate-commit v${version}`,
        'output is equal')
    })
  })

  test('test stdin with valid JSON', async (t) => {
    const validCommit = {
      id: '2b98d02b52',
      message: 'stream: make null an invalid chunk to write in object mode\n\nthis harmonizes behavior between readable, writable, and transform\nstreams so that they all handle nulls in object mode the same way by\nconsidering them invalid chunks.\n\nSigned-off-by: Calvin Metcalf <cmetcalf@appgeo.com>\nPR-URL: https://github.com/nodejs/node/pull/6170\nReviewed-By: James M Snell <jasnell@gmail.com>\nReviewed-By: Matteo Collina <matteo.collina@gmail.com>'
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

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 0, 'CLI exits with zero code on success')
      t.assert.match(compiledData, /[^0-9a-f]2b98d02b52[^0-9a-f]/, 'output contains commit id')
      t.assert.strictEqual(errorData, '', 'no error output')
    })
  })

  test('test stdin with invalid commit (missing subsystem)', async (t) => {
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

    await waitForClose(ls, (code) => {
      t.assert.notStrictEqual(code, 0, 'CLI exits with non-zero code on failure')
      t.assert.match(compiledData, /def456/, 'output contains commit id')
      t.assert.match(compiledData, /title-format/, 'output mentions the rule violation')
    })
  })

  test('test stdin with multiple commits', async (t) => {
    const commits = [
      {
        id: 'commit1',
        message: 'doc: update README\n\nSigned-off-by: Someone <someone@example.com>\nPR-URL: https://github.com/nodejs/node/pull/1111\nReviewed-By: Someone <someone@example.com>'
      },
      {
        id: 'commit2',
        message: 'test: add new test case\n\nSigned-off-by: Someone <someone@example.com>\nPR-URL: https://github.com/nodejs/node/pull/2222\nReviewed-By: Someone <someone@example.com>'
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

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 0, 'CLI exits with zero code on success')
      t.assert.match(compiledData, /commit1/, 'output contains first commit id')
      t.assert.match(compiledData, /commit2/, 'output contains second commit id')
    })
  })

  test('test stdin with TAP output', async (t) => {
    const validCommit = {
      id: '69435db261',
      message: 'chore: update tested node release lines (#94)'
    }
    const input = JSON.stringify([validCommit])

    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '--tap', '-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    await waitForClose(ls, (code) => {
      const output = compiledData.trim()
      t.assert.match(output,
        /# 69435db261/,
        'TAP output contains the sha of the commit being linted')
      t.assert.match(output,
        /not ok \d+ subsystem: Invalid subsystem: "chore" \(chore: update tested node release lines \(#94\)\)/,
        'TAP output contains failure for subsystem')
      t.assert.match(output,
        /# fail\s+\d+/,
        'TAP output contains total failures')
      t.assert.match(output,
        /# Please review the commit message guidelines:\s# https:\/\/github.com\/nodejs\/node\/blob\/HEAD\/doc\/contributing\/pull-requests.md#commit-message-guidelines/,
        'TAP output contains pointer to commit message guidelines')
      t.assert.strictEqual(code, 1, 'CLI exits with non-zero code on failure')
    })
  })

  test('test stdin with invalid JSON', async (t) => {
    const input = 'this is not valid JSON'

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 1, 'CLI exits with non-zero code on error')
      t.assert.match(errorData, /Error parsing JSON input/, 'error message is shown')
    })
  })

  test('test stdin with non-array JSON', async (t) => {
    const input = JSON.stringify({ id: 'test', message: 'test' })

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 1, 'CLI exits with non-zero code on error')
      t.assert.match(errorData, /Input must be an array/, 'error message is shown')
    })
  })

  test('test stdin with missing properties', async (t) => {
    const input = JSON.stringify([{ id: 'test' }]) // missing 'message'

    const ls = spawn('./bin/cmd.js', ['-'])
    let errorData = ''

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 1, 'CLI exits with non-zero code on error')
      t.assert.match(errorData, /must have "id" and "message" properties/, 'error message is shown')
    })
  })

  test('test stdin with --no-validate-metadata', async (t) => {
    const commit = {
      id: 'novalidate',
      message: 'doc: update README\n\nThis commit has no PR-URL or reviewers\n\nSigned-off-by: Someone <someone@example.com>'
    }
    const input = JSON.stringify([commit])

    const ls = spawn('./bin/cmd.js', ['--no-validate-metadata', '-'])
    let compiledData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stdin.write(input)
    ls.stdin.end()

    await waitForClose(ls, (code) => {
      t.assert.strictEqual(code, 0, 'CLI exits with zero code when metadata validation is disabled')
      t.assert.match(compiledData, /novalidate/, 'output contains commit id')
    })
  })
})
