'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/reviewers')
const Commit = require('gitlint-parser-node')
const Validator = require('../../')
const MSG = 'Commit must have at least 1 reviewer.'

test('rule: reviewers', (t) => {
  t.test('missing', (tt) => {
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

This is a test`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'reviewers', 'id')
      tt.equal(opts.message, MSG, 'message')
      tt.equal(opts.string, null, 'string')
      tt.equal(opts.line, 0, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'error', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
