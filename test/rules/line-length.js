import { describe, test } from 'node:test'
import Rule from '../../lib/rules/line-length.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: line-length', () => {
  test('line too long', (t) => {
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

${'aaa'.repeat(30)}`
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.message, 'Line should be <= 72 columns.', 'message')
      t.assert.strictEqual(opts.string, 'aaa'.repeat(30), 'string')
      t.assert.strictEqual(opts.line, 1, 'line')
      t.assert.strictEqual(opts.column, 72, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('release commit', (t) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: `2016-01-01, Version 1.0.0

${'aaa'.repeat(30)}`
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('quoted lines', (t) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: `src: make foo mor foo-ey

Here’s the original code:

    ${'aaa'.repeat(30)}

That was the original code.
`
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('URLs', (t) => {
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Evan Lucas',
        email: 'evanlucas@me.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: `src: make foo mor foo-ey

https://${'very-'.repeat(80)}-long-url.org/

Trailer: value
`
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('Co-author trailers', (t) => {
    const v = new Validator()

    const good = new Commit({
      sha: 'f1496de5a7d5474e39eafaafe6f79befe5883a5b',
      author: {
        name: 'Jacob Smith',
        email: '3012099+JakobJingleheimer@users.noreply.github.com',
        date: '2025-12-22T09:40:42Z'
      },
      message: [
        'fixup!: apply case-insensitive suggestion',
        '',
        'Co-authored-by: Michaël Zasso <37011812+targos@users.noreply.github.com>'
      ].join('\n')
    }, v)

    good.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(good, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('Multi-line trailers', (t) => {
    const v = new Validator()

    const good = new Commit({
      sha: 'f1496de5a7d5474e39eafaafe6f79befe5883a5b',
      author: {
        name: 'Jacob Smith',
        email: '3012099+JakobJingleheimer@users.noreply.github.com',
        date: '2025-12-22T09:40:42Z'
      },
      message: [
        'subsystem: add support for foobar',
        '',
        'Lorem-Ipsum: dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
        '  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        '  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint',
        '  occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      ].join('\n')
    }, v)
    const tooLong = '  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    const bad = new Commit({
      sha: 'f1496de5a7d5474e39eafaafe6f79befe5883a5b',
      author: {
        name: 'Jacob Smith',
        email: '3012099+JakobJingleheimer@users.noreply.github.com',
        date: '2025-12-22T09:40:42Z'
      },
      message: [
        'subsystem: add support for foobar',
        '',
        'Lorem-Ipsum: dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
        '  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        tooLong
      ].join('\n')
    }, v)

    good.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }
    bad.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.message, 'Trailer should be <= 120 columns.', 'message')
      t.assert.strictEqual(opts.string, tooLong, 'string')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(good, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
    Rule.validate(bad, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('Signed-off-by and Assisted-by trailers', (t) => {
    const v = new Validator()

    const good = new Commit({
      sha: '016b3921626b58d9b595c90141e65c6fbe0c78e2',
      author: {
        name: 'John Connor',
        email: '9092381+JConnor1985@users.noreply.github.com',
        date: '2026-04-10T16:38:01Z'
      },
      message: [
        'subsystem: foobar',
        '',
        'Signed-off-by: John Connor <9092381+JConnor1985@users.noreply.github.com>',
        'Assisted-by: The Longest-Named Code Agent In The World <agent@example.com>'
      ].join('\n')
    }, v)

    good.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string, '', 'string')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(good, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  test('Signed-off-by and Assisted-by non-trailers', (t) => {
    t.plan(8)
    const v = new Validator()

    const context = new Commit({
      sha: '016b3921626b58d9b595c90141e65c6fbe0c78e2',
      author: {
        name: 'John Connor',
        email: '9092381+JConnor1985@users.noreply.github.com',
        date: '2026-04-10T16:38:01Z'
      },
      message: [
        'subsystem: foobar',
        '',
        'Signed-off-by: John Connor <9092381+JConnor1985@users.noreply.github.com>',
        'Assisted-by: The Longest-Named Code Agent In The World <agent@example.com>',
        '',
        'Actual-trailer: Value'
      ].join('\n')
    }, v)

    let called = 0
    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'line-length', 'id')
      t.assert.strictEqual(opts.string,
        called++
          ? 'Assisted-by: The Longest-Named Code Agent In The World <agent@example.com>'
          : 'Signed-off-by: John Connor <9092381+JConnor1985@users.noreply.github.com>', 'string')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })
})
