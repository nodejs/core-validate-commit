import { test } from 'tap'
import Rule from '../../lib/rules/assisted-by-is-trailer.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

test('rule: assisted-by-is-trailer', (t) => {
  t.test('no assisted-by', (tt) => {
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
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message, 'no Assisted-by metadata', 'message')
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
               'Assisted-by: Whatever'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message,
        'Assisted-by must be a trailer', 'message')
      tt.equal(opts.string,
        'Assisted-by: Whatever', 'string')
      tt.equal(opts.line, 0, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('not trailer - in body before metadata', (tt) => {
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
               'Assisted-by: Whatever\n' +
               '\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message,
        'Assisted-by must be a trailer', 'message')
      tt.equal(opts.string,
        'Assisted-by: Whatever', 'string')
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
               'Assisted-by: Whatever\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message,
        'Assisted-by is a trailer', 'message')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('multiple assisted-by as trailers', (tt) => {
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
               'Assisted-by: Whatever\n' +
               'Assisted-by: Something else\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message,
        'Assisted-by is a trailer', 'message')
      tt.equal(opts.level, 'pass', 'level')
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
               'Assisted-by: Whatever\n' +
               '\n' +
               'Assisted-by: Something else\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'assisted-by-is-trailer', 'id')
      tt.equal(opts.message,
        'Assisted-by must be a trailer', 'message')
      tt.equal(opts.string,
        'Assisted-by: Whatever', 'string')
      tt.equal(opts.line, 3, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
