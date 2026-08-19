import { describe, test } from 'node:test'
import Rule from '../../lib/rules/line-after-title.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: line-after-title', () => {
  test('no blank line', (t) => {
    t.plan(7)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-after-title', 'id')
      t.assert.strictEqual(opts.message, 'blank line expected after title', 'message')
      t.assert.strictEqual(opts.string, 'fhqwhgads', 'string')
      t.assert.strictEqual(opts.line, 1, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('blank line', (t) => {
    t.plan(4)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-after-title', 'id')
      t.assert.strictEqual(opts.message, 'blank line after title', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('just one line', (t) => {
    t.plan(4)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-after-title', 'id')
      t.assert.strictEqual(opts.message, 'blank line after title', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })
})
