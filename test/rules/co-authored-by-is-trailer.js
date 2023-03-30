import { test } from 'tap'
import Rule from '../../lib/rules/co-authored-by-is-trailer.js'
import Commit from 'gitlint-parser-node'
import Validator from '../../index.js'

test('rule: co-authored-by-is-trailer', (t) => {
  t.test('no co-authors', (tt) => {
    tt.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'fhqwhgads'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'co-authored-by-is-trailer', 'id')
      tt.equal(opts.message, 'no Co-authored-by metadata', 'message')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('no empty lines above', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               'Co-authored-by: Someone <someone@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'co-authored-by-is-trailer', 'id')
      tt.equal(opts.message, 'Co-authored-by must be a trailer', 'message')
      tt.equal(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      tt.equal(opts.line, 0, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('not trailer', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Co-authored-by: Someone <someone@example.com>\n' +
               '\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'co-authored-by-is-trailer', 'id')
      tt.equal(opts.message, 'Co-authored-by must be a trailer', 'message')
      tt.equal(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      tt.equal(opts.line, 3, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('not all are trailers', (tt) => {
    tt.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Co-authored-by: Someone <someone@example.com>\n' +
               '\n' +
               'Co-authored-by: Someone Else <someone.else@example.com>\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'co-authored-by-is-trailer', 'id')
      tt.equal(opts.message, 'Co-authored-by must be a trailer', 'message')
      tt.equal(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      tt.equal(opts.line, 3, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('is trailer', (tt) => {
    tt.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'More description.\n' +
               '\n' +
               'Co-authored-by: Someone <someone@example.com>\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'co-authored-by-is-trailer', 'id')
      tt.equal(opts.message, 'Co-authored-by is a trailer', 'message')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
