'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/pr-url')
const MISSING_PR_URL = 'Commit must have a PR-URL.'
const INVALID_PR_URL = 'PR-URL must be a url, not a pr number.'

test('rule: pr-url', (t) => {
  t.test('missing', (tt) => {
    tt.plan(7)
    const context = {
      prUrl: null
    , report: (opts) => {
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

  t.test('invalid', (tt) => {
    tt.plan(7)
    const context = {
      prUrl: '#1234'
    , body: [
        ''
      , 'PR-URL: #1234'
      ]
    , report: (opts) => {
        tt.pass('called report')
        tt.equal(opts.id, 'pr-url', 'id')
        tt.equal(opts.message, INVALID_PR_URL, 'message')
        tt.equal(opts.string, '#1234', 'string')
        tt.equal(opts.line, 1, 'line')
        tt.equal(opts.column, 8, 'column')
        tt.equal(opts.level, 'fail', 'level')
      }
    }

    Rule.validate(context)
  })

  t.end()
})
