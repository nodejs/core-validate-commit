import { describe, test } from 'node:test'
import Rule from '../../lib/rules/co-authored-by-is-trailer.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: co-authored-by-is-trailer', () => {
  test('no co-authors', (t) => {
    t.plan(4)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'no Co-authored-by metadata', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('no empty lines above', (t) => {
    t.plan(7)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'Co-authored-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      t.assert.strictEqual(opts.line, 0, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('quoting another commit message', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'deps: v8: cherry-pick deadbeef\n' +
               '\n' +
               'Original commit message:' +
               '\n' +
               '    Some description.\n' +
               '\n' +
               '    Co-authored-by: Someone <someone@example.com>\n' +
               '\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'no Co-authored-by metadata', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('not trailer', (t) => {
    t.plan(7)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'Co-authored-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('not all are trailers', (t) => {
    t.plan(7)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'Co-authored-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string, 'Co-authored-by: Someone <someone@example.com>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('is trailer', (t) => {
    t.plan(4)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'co-authored-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'Co-authored-by is a trailer', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })
})
