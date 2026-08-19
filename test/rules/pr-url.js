import { describe, test } from 'node:test'
import Rule from '../../lib/rules/pr-url.js'
const MISSING_PR_URL = 'Commit must have a PR-URL.'
const INVALID_PR_URL = 'PR-URL must be a GitHub pull request URL.'
const NUMERIC_PR_URL = 'PR-URL must be a URL, not a pull request number.'
const VALID_PR_URL = 'PR-URL is valid.'

describe('rule: pr-url', () => {
  test('missing', (t) => {
    t.plan(7)
    const context = {
      prUrl: null,
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, MISSING_PR_URL, 'message')
        t.assert.strictEqual(opts.string, null, 'string')
        t.assert.strictEqual(opts.line, 0, 'line')
        t.assert.strictEqual(opts.column, 0, 'column')
        t.assert.strictEqual(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  test('invalid numeric', (t) => {
    t.plan(7)
    const context = {
      prUrl: '#1234',
      body: [
        '',
        'PR-URL: #1234'
      ],
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, NUMERIC_PR_URL, 'message')
        t.assert.strictEqual(opts.string, '#1234', 'string')
        t.assert.strictEqual(opts.line, 1, 'line')
        t.assert.strictEqual(opts.column, 8, 'column')
        t.assert.strictEqual(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  test('invalid', (t) => {
    t.plan(7)
    const url = 'https://github.com/nodejs/node/issues/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, INVALID_PR_URL, 'message')
        t.assert.strictEqual(opts.string, url, 'string')
        t.assert.strictEqual(opts.line, 1, 'line')
        t.assert.strictEqual(opts.column, 8, 'column')
        t.assert.strictEqual(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  test('valid', (t) => {
    t.plan(7)
    const url = 'https://github.com/nodejs/node/pull/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, VALID_PR_URL, 'message')
        t.assert.strictEqual(opts.string, url, 'string')
        t.assert.strictEqual(opts.line, 1, 'line')
        t.assert.strictEqual(opts.column, 8, 'column')
        t.assert.strictEqual(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })

  test('valid URL containing hyphen', (t) => {
    t.plan(7)
    const url = 'https://github.com/nodejs/node-report/pull/1234'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, VALID_PR_URL, 'message')
        t.assert.strictEqual(opts.string, url, 'string')
        t.assert.strictEqual(opts.line, 1, 'line')
        t.assert.strictEqual(opts.column, 8, 'column')
        t.assert.strictEqual(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })

  test('valid URL with trailing slash', (t) => {
    t.plan(7)
    const url = 'https://github.com/nodejs/node-report/pull/1234/'
    const context = {
      prUrl: url,
      body: [
        '',
        `PR-URL: ${url}`
      ],
      report: (opts) => {
        t.assert.ok(true, 'called report')
        t.assert.strictEqual(opts.id, 'pr-url', 'id')
        t.assert.strictEqual(opts.message, VALID_PR_URL, 'message')
        t.assert.strictEqual(opts.string, url, 'string')
        t.assert.strictEqual(opts.line, 1, 'line')
        t.assert.strictEqual(opts.column, 8, 'column')
        t.assert.strictEqual(opts.level, 'pass', 'level')
      }
    }

    Rule.validate(context)
  })
})
