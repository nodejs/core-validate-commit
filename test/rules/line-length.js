'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/line-length')
const Commit = require('gitlint-parser-node')
const Validator = require('../../')

test('rule: line-length', (t) => {
  t.test('line too long', (tt) => {
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

${'aaa'.repeat(30)}`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.message, 'Line should be <= 72 columns.', 'message')
      tt.equal(opts.string, 'aaa'.repeat(30), 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 72, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72
      }
    })
  })

  t.test('release commit', (tt) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
    , author: {
        name: 'Evan Lucas'
      , email: 'evanlucas@me.com'
      , date: '2016-04-12T19:42:23Z'
      }
    , message: `2016-01-01, Version 1.0.0

${'aaa'.repeat(30)}`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'skip', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72
      }
    })
    tt.end()
  })

  t.test('quoted lines', (tt) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
    , author: {
        name: 'Evan Lucas'
      , email: 'evanlucas@me.com'
      , date: '2016-04-12T19:42:23Z'
      }
    , message: `src: make foo mor foo-ey

Here’s the original code:

    ${'aaa'.repeat(30)}

That was the original code.
`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72
      }
    })
    tt.end()
  })

  t.test('URLs', (tt) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
    , author: {
        name: 'Evan Lucas'
      , email: 'evanlucas@me.com'
      , date: '2016-04-12T19:42:23Z'
      }
    , message: `src: make foo mor foo-ey

https://${'very-'.repeat(80)}-long-url.org/
`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72
      }
    })
    tt.end()
  })

  t.end()
})
