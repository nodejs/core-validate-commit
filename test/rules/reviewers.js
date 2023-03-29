import { test } from 'tap'
import Rule from '../../lib/rules/reviewers.js'
import Commit from 'gitlint-parser-node'
import Validator from '../../index.js'
const MSG = 'Commit must have at least 1 reviewer.'

test('rule: reviewers', (t) => {
  t.test('missing', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: `test: fix something

This is a test`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'reviewers', 'id')
      tt.equal(opts.message, MSG, 'message')
      tt.equal(opts.string, null, 'string')
      tt.equal(opts.line, 0, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('skip for release commit', (tt) => {
    tt.plan(2)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: `2016-04-12, Version x.y.z

This is a test`
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'reviewers',
        message: 'skipping reviewers for release commit',
        string: '',
        level: 'skip'
      })
    }

    Rule.validate(context)
  })

  t.end()
})
