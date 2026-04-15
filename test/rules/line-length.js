import { test } from 'tap'
import Rule from '../../lib/rules/line-length.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

test('rule: line-length', (t) => {
  t.test('line too long', (tt) => {
    tt.plan(7)
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.message, 'Line should be <= 72 columns.', 'message')
      tt.equal(opts.string, 'aaa'.repeat(30), 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 72, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
  })

  t.test('release commit', (tt) => {
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'skip', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
    tt.end()
  })

  t.test('quoted lines', (tt) => {
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
    tt.end()
  })

  t.test('URLs', (tt) => {
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })
    tt.end()
  })

  t.test('Co-author trailers', (tt) => {
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(good, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })

    tt.end()
  })

  t.test('Signed-off-by and Assisted-by trailers', (tt) => {
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
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, '', 'string')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(good, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })

    tt.end()
  })

  t.test('Signed-off-by and Assisted-by non-trailers', (tt) => {
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

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'line-length', 'id')
      tt.equal(opts.string, 'Assisted-by: The Longest-Named Code Agent In The World <agent@example.com>', 'string')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context, {
      options: {
        length: 72,
        trailerLength: 120
      }
    })

    tt.end()
  })

  t.end()
})
