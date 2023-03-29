import { test } from 'tap'
import Rule from '../../lib/rules/title-format.js'
import Commit from 'gitlint-parser-node'
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

test('rule: title-format', (t) => {
  t.test('space after subsystem', (tt) => {
    tt.plan(2)
    const context = makeCommit('test:missing space')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'Add a space after subsystem(s).',
        string: 'test:missing space',
        line: 0,
        column: 5,
        level: 'fail'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('space after subsystem, colon in message', (tt) => {
    tt.plan(2)
    const context = makeCommit('test: missing:space')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('consecutive spaces', (tt) => {
    tt.plan(2)
    const context = makeCommit('test: with  two spaces')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'Do not use consecutive spaces in title.',
        string: 'test: with  two spaces',
        line: 0,
        column: 11,
        level: 'fail'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('first word after subsystem should be in lowercase', (tt) => {
    tt.plan(2)
    const context = makeCommit('test: Some message')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'First word after subsystem(s) in title should be lowercase.',
        string: 'test: Some message',
        line: 0,
        column: 7,
        level: 'fail'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('colon in message followed by uppercase word', (tt) => {
    tt.plan(2)
    const context = makeCommit('test: some message: Message')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.test('Skip case checks for V8 updates ', (tt) => {
    tt.plan(2)
    const context = makeCommit('deps: V8: cherry-pick e0a109c')

    context.report = (opts) => {
      tt.pass('called report')
      tt.strictSame(opts, {
        id: 'title-format',
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }

    Rule.validate(context)
    tt.end()
  })

  t.end()
})
