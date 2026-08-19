import { describe, test } from 'node:test'
import Rule from '../../lib/rules/title-format.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

function makeCommit (title) {
  const v = new Validator()
  return new Commit({
    sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
    author: {
      name: 'Evan Lucas',
      email: 'evanlucas@me.com',
      date: '2016-04-12T19:42:23Z'
    },
    message: title
  }, v)
}

describe('rule: title-format', () => {
  test('space after subsystem', (t) => {
    t.plan(2)
    const context = makeCommit('test:missing space')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'Add a space after subsystem(s).',
        string: 'test:missing space',
        line: 0,
        column: 5,
        level: 'fail'
      })
    }

    Rule.validate(context)
  })

  test('space after subsystem, colon in message', (t) => {
    t.plan(2)
    const context = makeCommit('test: missing:space')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
  })

  test('consecutive spaces', (t) => {
    t.plan(2)
    const context = makeCommit('test: with  two spaces')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'Do not use consecutive spaces in title.',
        string: 'test: with  two spaces',
        line: 0,
        column: 11,
        level: 'fail'
      })
    }

    Rule.validate(context)
  })

  test('first word after subsystem should be in lowercase', (t) => {
    t.plan(2)
    const context = makeCommit('test: Some message')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'First word after subsystem(s) in title should be lowercase.',
        string: 'test: Some message',
        line: 0,
        column: 7,
        level: 'fail'
      })
    }

    Rule.validate(context)
  })

  test('colon in message followed by uppercase word', (t) => {
    t.plan(2)
    const context = makeCommit('test: some message: Message')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
  })

  test('Skip case checks for V8 updates ', (t) => {
    t.plan(2)
    const context = makeCommit('deps: V8: cherry-pick e0a109c')

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.deepStrictEqual(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
  })
})
