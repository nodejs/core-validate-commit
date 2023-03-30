import { test } from 'tap'
import Rule from '../../lib/rules/subsystem.js'
import Commit from 'gitlint-parser-node'
import Validator from '../../index.js'

test('rule: subsystem', (t) => {
  t.test('invalid', (tt) => {
    tt.plan(7)
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
      tt.pass('called report')
      tt.equal(opts.id, 'subsystem', 'id')
      tt.equal(opts.message, 'Invalid subsystem: "fhqwhgads"', 'message')
      tt.equal(opts.string, 'fhqwhgads: come on', 'string')
      tt.equal(opts.line, 0, 'line')
      tt.equal(opts.column, 0, 'column')
      tt.equal(opts.level, 'fail', 'level')
      tt.end()
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
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
      message: '2016-04-12, Version x.y.z'
    }, v)

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'subsystem',
        message: 'Release commits do not have subsystems',
        string: '',
        level: 'skip'
      })
      tt.end()
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
  })

  t.test('valid', (tt) => {
    tt.plan(2)

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
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'subsystem',
        message: 'valid subsystems',
        string: 'quic',
        level: 'pass'
      })
      tt.end()
    }

    Rule.validate(context, { options: { subsystems: Rule.defaults.subsystems } })
  })
  t.end()
})
