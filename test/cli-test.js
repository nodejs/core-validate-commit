import { test } from 'tap'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync, spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsystems from '../lib/rules/subsystem.js'

const cmdPath = fileURLToPath(new URL('../bin/cmd.js', import.meta.url))

function git (cwd, args, env = undefined) {
  return execFileSync('git', args, {
    cwd,
    env: env === undefined ? process.env : { ...process.env, ...env },
    encoding: 'utf8'
  })
}

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

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.match(compiledData, /[^0-9a-f]2b98d02b52[^0-9a-f]/, 'output contains commit id')
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

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.match(compiledData, /commit1/, 'output contains first commit id')
      tt.match(compiledData, /commit2/, 'output contains second commit id')
      tt.end()
    })
  })

  t.test('test stdin with TAP output', (tt) => {
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

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code when metadata validation is disabled')
      tt.match(compiledData, /novalidate/, 'output contains commit id')
      tt.end()
    })
  })

  t.test('test sha ignores mailmap when validating sign-off', (tt) => {
    tt.plan(6)

    const repoDir = mkdtempSync(join(tmpdir(), 'core-validate-commit-'))
    const env = {
      GIT_AUTHOR_NAME: 'Matteo Collina',
      GIT_AUTHOR_EMAIL: 'hello@matteocollina.com',
      GIT_COMMITTER_NAME: 'Matteo Collina',
      GIT_COMMITTER_EMAIL: 'hello@matteocollina.com'
    }

    git(repoDir, ['init', '-b', 'main'])
    git(repoDir, ['config', 'user.name', 'Test User'])
    git(repoDir, ['config', 'user.email', 'test@example.com'])

    writeFileSync(join(repoDir, '.mailmap'),
      'Matteo Collina <matteo.collina@gmail.com> <hello@matteocollina.com>\n')
    writeFileSync(join(repoDir, 'README.md'), 'test\n')

    git(repoDir, ['add', '.mailmap', 'README.md'])
    git(repoDir, ['commit', '-m',
      'doc: add mailmap sign-off fixture\n\n' +
      'Signed-off-by: Matteo Collina <hello@matteocollina.com>\n' +
      'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
      'Reviewed-By: Rich Trott <rtrott@gmail.com>'
    ], env)

    const defaultShow = git(repoDir, ['show', '--quiet', '--format=medium', 'HEAD'])
    const rawShow = git(repoDir, ['show', '--no-mailmap', '--quiet', '--format=medium', 'HEAD'])

    tt.match(defaultShow,
      /Author:\s+Matteo Collina <matteo\.collina@gmail\.com>/,
      'git show applies mailmap by default')
    tt.match(rawShow,
      /Author:\s+Matteo Collina <hello@matteocollina\.com>/,
      'git show --no-mailmap preserves the raw author email')

    const ls = spawn(process.execPath, [cmdPath, '--no-validate-metadata', 'HEAD'], {
      cwd: repoDir,
      env: { ...process.env, FORCE_COLOR: 0 }
    })
    let compiledData = ''
    let errorData = ''

    ls.stdout.on('data', (data) => {
      compiledData += data
    })

    ls.stderr.on('data', (data) => {
      errorData += data
    })

    ls.on('close', (code) => {
      tt.equal(code, 0, 'CLI exits with zero code on success')
      tt.equal(errorData, '', 'no error output')
      tt.match(compiledData, /has valid Signed-off-by/, 'sign-off remains valid')
      tt.notMatch(compiledData,
        /email does not match the commit author email/,
        'mailmap does not trigger a false mismatch warning')
    })
  })

  t.end()
})
