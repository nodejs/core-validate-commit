'use strict'

const { test } = require('tap')
const proxyquire = require('proxyquire')
const nock = require('nock')

const commitHash = 'a12b34c56'

test('Test util functions', (t) => {
  t.test('test sha load function', (tt) => {
    const commitMessage = 'Commit Message'

    const utils = proxyquire('../lib/utils', {
      'child_process': {
        exec: (cmd, cb) => {
          tt.equals(cmd,
                    `git show --quiet --format=medium ${commitHash}`,
                    'cmd should be equal')
          cb(null, commitMessage)
        }
      }
    })

    utils.load(commitHash, (err, stdout, stderr) => {
      tt.equals(err, null, 'Should not be an error')
      tt.equals(commitMessage, stdout, 'should have the commit message')
      tt.end()
    })
  })

  t.test('test sha load function with error', (tt) => {
    const utils = proxyquire('../lib/utils', {
      'child_process': {
        exec: (cmd, cb) => {
          cb('Error', null)
        }
      }
    })

    utils.load(commitHash, (err, stdout, stderr) => {
      tt.equals(err, 'Error', 'should have the error message')
      tt.end()
    })
  })

  t.test('test load patch function using http', (tt) => {
    const commitUrl = `http://api.github.com/repos/nodejs/${commitHash}`
    const util = require('../lib/utils')

    nock('http://api.github.com', {
      reqheaders: {
        'user-agent': 'core-validate-commit'
      }
    })
      .get(`/repos/nodejs/${commitHash}`)
      .reply(200, {commit: 'message'})

    util.load(commitUrl, (err, commitMessage) => {
      tt.equals(err, null, 'Should not be an error')
      tt.pass()
      tt.end()
    })
  })

  t.test('test load patch function using https', (tt) => {
    const commitUrl = `https://api.github.com/repos/nodejs/${commitHash}`
    const util = require('../lib/utils')

    nock('https://api.github.com', {
      reqheaders: {
        'user-agent': 'core-validate-commit'
      }
    })
      .get(`/repos/nodejs/${commitHash}`)
      .reply(200, {commit: 'message'})

    util.load(commitUrl, (err, commitMessage) => {
      tt.equals(err, null, 'Should not be an error')
      tt.pass()
      tt.end()
    })
  })

  t.test('test load patch function - catch parse error', (tt) => {
    const commitUrl = `http://api.github.com/repos/nodejs/${commitHash}`
    const util = require('../lib/utils')

    nock('http://api.github.com', {
      reqheaders: {
        'user-agent': 'core-validate-commit'
      }
    })
      .get(`/repos/nodejs/${commitHash}`)
      .reply(200, '{commit: \'message\'}')

    util.load(commitUrl, (err, commitMessage) => {
      tt.true(err)
      tt.pass()
      tt.end()
    })
  })

  t.end()
})
