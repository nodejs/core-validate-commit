'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/title-format')
const Commit = require('gitlint-parser-node')
const Validator = require('../../')

function makeCommit(title) {
  const v = new Validator()
  return new Commit({
    sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
  , author: {
      name: 'Evan Lucas'
    , email: 'evanlucas@me.com'
    , date: '2016-04-12T19:42:23Z'
    }
  , message: title
  }, v)
}

test('rule: title-format', (t) => {
  t.test('space after subsystem', (tt) => {
    tt.plan(2)
    const context = makeCommit('test:missing space')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format'
      , message: 'Add a space after subsystem(s).'
      , string: 'test:missing space'
      , line: 0
      , column: 5
      , level: 'fail'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('consecutive spaces', (tt) => {
    tt.plan(2)
    const context = makeCommit('test: with  two spaces')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format'
      , message: 'Do not use consecutive spaces in title.'
      , string: 'test: with  two spaces'
      , line: 0
      , column: 11
      , level: 'fail'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.end()
})
