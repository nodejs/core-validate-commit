import { test } from 'tap'
import Rule from '../../lib/rules/pr-url.js'
const MISSING_PR_URL = 'Commit must have a PR-URL.'
const INVALID_PR_URL = 'PR-URL must be a GitHub pull request URL.'
const NUMERIC_PR_URL = 'PR-URL must be a URL, not a pull request number.'
const VALID_PR_URL = 'PR-URL is valid.'

test('rule: pr-url', (t) => {
  t.test('missing', (tt) => {
    tt.plan(7)
    const context = {
      prUrl: null,
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, MISSING_PR_URL, 'message')
        tt.equal(opts.string, null, 'string')
        tt.equal(opts.line, 0, 'line')
        tt.equal(opts.column, 0, 'column')
        tt.equal(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  t.test('invalid numeric', (tt) => {
    tt.plan(7)
    const context = {
      prUrl: '#1234',
      body: [
        '',
        'PR-URL: #1234'
      ],
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, NUMERIC_PR_URL, 'message')
        tt.equal(opts.string, '#1234', 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  t.test('invalid', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/issues/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, INVALID_PR_URL, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  t.test('valid', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/pull/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, VALID_PR_URL, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })

  t.test('valid URL containing hyphen', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node-report/pull/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, VALID_PR_URL, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })

  t.test('valid URL with trailing slash', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node-report/pull/1234/'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, VALID_PR_URL, 'message')
        tt.equal(opts.string, url, 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })

  t.end()
})
