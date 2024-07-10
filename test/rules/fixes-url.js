import { test } from 'tap'
import Rule from '../../lib/rules/fixes-url.js'
import Commit from 'gitlint-parser-node'
import Validator from '../../index.js'

const INVALID_PRURL = 'Pull request URL must reference a comment or discussion.'
const NOT_AN_ISSUE_NUMBER = 'Fixes must be a URL, not an issue number.'
const NOT_A_GITHUB_URL = 'Fixes must be a GitHub URL.'
const VALID_FIXES_URL = 'Valid fixes URL.'

const makeCommit = (msg) => {
  return new Commit({
    sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
    author: {
      name: 'Evan Lucas',
      email: 'evanlucas@me.com',
      date: '2016-04-12T19:42:23Z'
    },
    message: msg
  }, new Validator())
}

test('rule: fixes-url', (t) => {
  const valid = [
    ['GitHub issue URL',
      'https://github.com/nodejs/node/issues/1234'],
    ['GitHub issue URL with trailing slash',
      'https://github.com/nodejs/node/issues/1234/'],
    ['GitHub issue URL containing hyphen',
      'https://github.com/nodejs/node-report/issues/1234'],
    ['GitHub issue URL containing hyphen with comment',
      'https://github.com/nodejs/node-report/issues/1234#issuecomment-1234'],
    ['GitHub issue URL with comment',
      'https://github.com/nodejs/node/issues/1234#issuecomment-1234'],
    ['GitHub PR URL containing hyphen with comment',
      'https://github.com/nodejs/node-report/pull/1234#issuecomment-1234'],
    ['GitHub PR URL containing hyphen with discussion comment',
      'https://github.com/nodejs/node-report/pull/1234#discussion_r1234'],
    ['GitHub PR URL with comment',
      'https://github.com/nodejs/node/pull/1234#issuecomment-1234'],
    ['GitHub PR URL with discussion comment',
      'https://github.com/nodejs/node/pull/1234#discussion_r1234']
  ]

  for (const [name, url] of valid) {
    t.test(name, (tt) => {
      tt.plan(7)
      const context = makeCommit(`test: fix something

Fixes: ${url}`
      )

      context.report = (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'fixes-url', 'id')
        tt.equal(opts.message, VALID_FIXES_URL, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 7, 'column')
        tt.equal(opts.level, 'pass', 'level')
      }

      Rule.validate(context)
    })
  }

  const invalid = [
    ['issue number', NOT_AN_ISSUE_NUMBER,
      '#1234'],
    ['GitHub PR URL', INVALID_PRURL,
      'https://github.com/nodejs/node/pull/1234'],
    ['GitHub PR URL containing hyphen', INVALID_PRURL,
      'https://github.com/nodejs/node-report/pull/1234'],
    ['non-GitHub URL', NOT_A_GITHUB_URL,
      'https://nodejs.org'],
    ['not a URL or issue number', NOT_A_GITHUB_URL,
      'fhqwhgads']
  ]
  for (const [name, expected, url] of invalid) {
    t.test(name, (tt) => {
      tt.plan(7)
      const context = makeCommit(`test: fix something

Fixes: ${url}`
      )

      context.report = (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'fixes-url', 'id')
        tt.equal(opts.message, expected, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 7, 'column')
        tt.equal(opts.level, 'fail', 'level')
      }

      Rule.validate(context)
    })
  }

  t.end()
})
