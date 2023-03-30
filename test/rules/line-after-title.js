import { test } from 'tap'
import Rule from '../../lib/rules/line-after-title.js'
import Commit from 'gitlint-parser-node'
import Validator from '../../index.js'

test('rule: line-after-title', (t) => {
  t.test('no blank line', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\nfhqwhgads'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-after-title', 'id')
      tt.equal(opts.message, 'blank line expected after title', 'message')
      tt.equal(opts.string, 'fhqwhgads', 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('blank line', (tt) => {
    tt.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n\nfhqwhgads'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-after-title', 'id')
      tt.equal(opts.message, 'blank line after title', 'message')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('just one line', (tt) => {
    tt.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-after-title', 'id')
      tt.equal(opts.message, 'blank line after title', 'message')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
