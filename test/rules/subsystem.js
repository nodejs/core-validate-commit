import { describe, test } from 'node:test'
import Rule from '../../lib/rules/subsystem.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: subsystem', () => {
  test('invalid', (t) => {
    t.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'fhqwhgads: come on'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'subsystem', 'id')
      t.assert.strictEqual(opts.message, 'Invalid subsystem: "fhqwhgads"', 'message')
      t.assert.strictEqual(opts.string, 'fhqwhgads: come on', 'string')
      t.assert.strictEqual(opts.line, 0, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
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
      message: '2016-04-12, Version x.y.z'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'subsystem',
        message: 'Release commits do not have subsystems',
        string: '',
        level: 'skip'
      })
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
  })

  test('valid', (t) => {
    t.plan(2)

    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'quic: come on, fhqwhgads'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'subsystem',
        message: 'valid subsystems',
        string: 'quic',
        level: 'pass'
      })
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
  })
})
