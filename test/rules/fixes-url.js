'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/fixes-url')
const Commit = require('gitlint-parser-node')
const Validator = require('../../')
const INVALID_FIXES_URL = 'Fixes must be a url, not an issue number.'

test('rule: fixes-url', (t) => {
  t.test('invalid', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
    , author: {
        name: 'Evan Lucas'
      , email: 'evanlucas@me.com'
      , date: '2016-04-12T19:42:23Z'
      }
    , message: `test: fix something

Fixes: #1234`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, INVALID_FIXES_URL, 'message')
      tt.equal(opts.string, '#1234', 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
