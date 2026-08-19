import { describe, test } from 'node:test'
import Rule from '../../lib/rules/assisted-by-is-trailer.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: assisted-by-is-trailer', () => {
  test('no assisted-by', (t) => {
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
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message, 'no Assisted-by metadata', 'message')
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
               'Assisted-by: Whatever'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message,
        'Assisted-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string,
        'Assisted-by: Whatever', 'string')
      t.assert.strictEqual(opts.line, 0, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('not trailer - in body before metadata', (t) => {
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
               'Assisted-by: Whatever\n' +
               '\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message,
        'Assisted-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string,
        'Assisted-by: Whatever', 'string')
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
               'Assisted-by: Whatever\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message,
        'Assisted-by is a trailer', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('multiple assisted-by as trailers', (t) => {
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
               'Assisted-by: Whatever\n' +
               'Assisted-by: Something else\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message,
        'Assisted-by is a trailer', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
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
               'Assisted-by: Whatever\n' +
               '\n' +
               'Assisted-by: Something else\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'assisted-by-is-trailer', 'id')
      t.assert.strictEqual(opts.message,
        'Assisted-by must be a trailer', 'message')
      t.assert.strictEqual(opts.string,
        'Assisted-by: Whatever', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })
})
