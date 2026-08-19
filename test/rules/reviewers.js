import { describe, test } from 'node:test'
import Rule from '../../lib/rules/reviewers.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'
const MSG = 'Commit must have at least 1 reviewer.'

describe('rule: reviewers', () => {
  test('missing', (t) => {
    t.plan(7)
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
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'reviewers', 'id')
      t.assert.strictEqual(opts.message, MSG, 'message')
      t.assert.strictEqual(opts.string, null, 'string')
      t.assert.strictEqual(opts.line, 0, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('skip for release commit', (t) => {
    t.plan(2)
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
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'reviewers',
        message: 'skipping reviewers for release commit',
        string: '',
        level: 'skip'
      })
    }

    Rule.validate(context)
  })
})
