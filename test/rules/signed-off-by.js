import { describe, test } from 'node:test'
import Rule from '../../lib/rules/signed-off-by.js'
import Commit from '../../lib/gitlint-parser.js'
import Validator from '../../index.js'

describe('rule: signed-off-by', () => {
  test('valid sign-off', (t) => {
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
               'Signed-off-by: Foo <foo@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('missing sign-off', (t) => {
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
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'Commit must have a "Signed-off-by" trailer', 'message')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('invalid email - no angle brackets', (t) => {
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
               'Signed-off-by: Foo foo@example.com\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        '"Signed-off-by" trailer has invalid email', 'message')
      t.assert.strictEqual(opts.string,
        'Signed-off-by: Foo foo@example.com', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('invalid email - no domain', (t) => {
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
               'Signed-off-by: Foo <foo@>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        '"Signed-off-by" trailer has invalid email', 'message')
      t.assert.strictEqual(opts.string,
        'Signed-off-by: Foo <foo@>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('missing name', (t) => {
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
               'Signed-off-by: <foo@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        '"Signed-off-by" trailer has invalid email', 'message')
      t.assert.strictEqual(opts.string,
        'Signed-off-by: <foo@example.com>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  test('release commit', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: '2024-01-01, Version 22.0.0 (Current)\n' +
               '\n' +
               'Notable changes:\n' +
               '\n' +
               'Some changes here.'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for release commit', 'message')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context)
  })

  test('deps commit without sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Richard Lau',
        email: 'richard.lau@ibm.com',
        date: '2026-03-28T22:57:44Z'
      },
      message: 'deps: V8: cherry-pick cf1bce40a5ef\n' +
               '\n' +
               'Original commit message:\n' +
               '\n' +
               '    [wasm] Fix S128Const on big endian\n' +
               '\n' +
               'Refs: https://github.com/v8/v8/commit/cf1bce40a5ef\n' +
               'PR-URL: https://github.com/nodejs/node/pull/62449\n' +
               'Reviewed-By: Guy Bedford <guybedford@gmail.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for deps commit', 'message')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context)
  })

  test('deps commit with sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Richard Lau',
        email: 'richard.lau@ibm.com',
        date: '2026-03-28T22:57:44Z'
      },
      message: 'deps: V8: cherry-pick cf1bce40a5ef\n' +
               '\n' +
               'Original commit message:\n' +
               '\n' +
               '    [wasm] Fix S128Const on big endian\n' +
               '\n' +
               'Signed-off-by: Richard Lau <richard.lau@ibm.com>\n' +
               'Refs: https://github.com/v8/v8/commit/cf1bce40a5ef\n' +
               'PR-URL: https://github.com/nodejs/node/pull/62449\n' +
               'Reviewed-By: Guy Bedford <guybedford@gmail.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for deps commit', 'message')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context)
  })

  test('mixed deps commit without sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2026-03-28T22:57:44Z'
      },
      message: 'deps,src: update V8 and fix build\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'Commit with non-deps changes should have a ' +
        '"Signed-off-by" trailer', 'message')
      t.assert.strictEqual(opts.level, 'warn', 'level')
    }

    Rule.validate(context)
  })

  test('mixed deps commit with valid sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'foo@example.com',
        date: '2026-03-28T22:57:44Z'
      },
      message: 'deps,src: update V8 and fix build\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Foo <foo@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('backport commit without sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Anna Henningsen',
        email: 'anna@addaleax.net',
        date: '2026-03-03T23:12:18Z'
      },
      message: 'src: convert context_frame field in AsyncWrap\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'PR-URL: https://github.com/nodejs/node/pull/62103\n' +
               'Backport-PR-URL: https://github.com/nodejs/node/pull/62357\n' +
               'Reviewed-By: Anna Henningsen <anna@addaleax.net>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for backport commit', 'message')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context)
  })

  test('backport commit with sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Anna Henningsen',
        email: 'anna@addaleax.net',
        date: '2026-03-03T23:12:18Z'
      },
      message: 'src: convert context_frame field in AsyncWrap\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Anna Henningsen <anna@addaleax.net>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/62103\n' +
               'Backport-PR-URL: https://github.com/nodejs/node/pull/62357\n' +
               'Reviewed-By: Anna Henningsen <anna@addaleax.net>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for backport commit', 'message')
      t.assert.strictEqual(opts.level, 'skip', 'level')
    }

    Rule.validate(context)
  })

  test('multiple valid sign-offs', (t) => {
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
               'Signed-off-by: Foo <foo@example.com>\n' +
               'Signed-off-by: Bar <bar@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Baz <baz@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('bot author with sign-off - name with [bot] suffix', (t) => {
    t.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'dependabot[bot]',
        email: '49699333+dependabot[bot]@users.noreply.github.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: dependabot[bot] ' +
               '<49699333+dependabot[bot]@users.noreply.github.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'bot commit should not have a "Signed-off-by" trailer', 'message')
      t.assert.match(opts.string, /dependabot\[bot\]/, 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'warn', 'level')
    }

    Rule.validate(context)
  })

  test('bot author with sign-off - GitHub bot noreply email', (t) => {
    t.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'some-tool[bot]',
        email: 'some-tool[bot]@users.noreply.github.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: some-tool[bot] ' +
               '<some-tool[bot]@users.noreply.github.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'bot commit should not have a "Signed-off-by" trailer', 'message')
      t.assert.match(opts.string, /some-tool\[bot\]/, 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'warn', 'level')
    }

    Rule.validate(context)
  })

  test('bot author without sign-off', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'dependabot[bot]',
        email: '49699333+dependabot[bot]@users.noreply.github.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'build(deps): bump some-package from 1.0.0 to 2.0.0\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for bot commit', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('bot author - Node.js GitHub Bot', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Node.js GitHub Bot',
        email: 'github-bot@iojs.org',
        date: '2026-03-22T00:28:21Z'
      },
      message: 'test: update WPT for url to fc3e651593\n' +
               '\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'skipping sign-off for bot commit', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('bot author with human sign-off', (t) => {
    t.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'dependabot[bot]',
        email: '49699333+dependabot[bot]@users.noreply.github.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'build(deps): bump some-package from 1.0.0 to 2.0.0\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Human <human@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        'bot commit should not have a "Signed-off-by" trailer', 'message')
      t.assert.strictEqual(opts.string,
        'Signed-off-by: Human <human@example.com>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'warn', 'level')
    }

    Rule.validate(context)
  })

  test('author email mismatch', (t) => {
    t.plan(7)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Alice',
        email: 'alice@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Bob <bob@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message,
        '"Signed-off-by" email does not match the ' +
        'commit author email', 'message')
      t.assert.strictEqual(opts.string,
        'Signed-off-by: Bob <bob@example.com>', 'string')
      t.assert.strictEqual(opts.line, 3, 'line')
      t.assert.strictEqual(opts.column, 0, 'column')
      t.assert.strictEqual(opts.level, 'warn', 'level')
    }

    Rule.validate(context)
  })

  test('author email matches one of multiple sign-offs', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Alice',
        email: 'alice@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Bob <bob@example.com>\n' +
               'Signed-off-by: Alice <alice@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('no author info available - skips mismatch check', (t) => {
    t.plan(4)
    const v = new Validator()
    // Simulate stdin JSON input which has no author info.
    // Use a plain object context with no author field.
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Someone <someone@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('author email mismatch is case-insensitive', (t) => {
    t.plan(4)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Foo',
        email: 'Foo@Example.COM',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: Foo <foo@example.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    context.report = (opts) => {
      t.assert.ok(true, 'called report')
      t.assert.strictEqual(opts.id, 'signed-off-by', 'id')
      t.assert.strictEqual(opts.message, 'has valid Signed-off-by', 'message')
      t.assert.strictEqual(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  test('multiple sign-offs with some invalid emails', (t) => {
    t.plan(9)
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
               'Signed-off-by: Bad One bad@\n' +
               'Signed-off-by: Foo <foo@example.com>\n' +
               'Signed-off-by: Bad Two noangles@example.com\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    const reports = []
    context.report = (opts) => {
      reports.push(opts)
    }

    Rule.validate(context)

    // Should get 3 reports: 2 fails for invalid emails + 1 pass
    t.assert.strictEqual(reports.length, 3, 'total reports')

    t.assert.strictEqual(reports[0].level, 'fail', 'first invalid is fail')
    t.assert.strictEqual(reports[0].message,
      '"Signed-off-by" trailer has invalid email', 'first message')
    t.assert.strictEqual(reports[0].string,
      'Signed-off-by: Bad One bad@', 'first string')

    t.assert.strictEqual(reports[1].level, 'fail', 'second invalid is fail')
    t.assert.strictEqual(reports[1].message,
      '"Signed-off-by" trailer has invalid email', 'second message')
    t.assert.strictEqual(reports[1].string,
      'Signed-off-by: Bad Two noangles@example.com', 'second string')

    t.assert.strictEqual(reports[2].level, 'pass', 'valid one passes')
    t.assert.strictEqual(reports[2].message,
      'has valid Signed-off-by', 'pass message')
  })

  test('human author with only bot sign-offs', (t) => {
    t.plan(5)
    const v = new Validator()
    const context = new Commit({
      sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea',
      author: {
        name: 'Alice',
        email: 'alice@example.com',
        date: '2016-04-12T19:42:23Z'
      },
      message: 'test: fix something\n' +
               '\n' +
               'Some description.\n' +
               '\n' +
               'Signed-off-by: dependabot[bot] ' +
               '<49699333+dependabot[bot]@users.noreply.github.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    const reports = []
    context.report = (opts) => {
      reports.push(opts)
    }

    Rule.validate(context)

    // Should get 2 reports: warn for bot sign-off + fail for no human sign-off
    t.assert.strictEqual(reports.length, 2, 'total reports')

    t.assert.strictEqual(reports[0].level, 'warn', 'bot sign-off is warn')
    t.assert.match(reports[0].string, /dependabot\[bot\]/, 'bot string')

    t.assert.strictEqual(reports[1].level, 'fail', 'no human sign-off is fail')
    t.assert.strictEqual(reports[1].message,
      'Commit must have a "Signed-off-by" trailer from a human author',
      'fail message')
  })

  test('multiple sign-offs with human and bot', (t) => {
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
               'Signed-off-by: Foo <foo@example.com>\n' +
               'Signed-off-by: dependabot[bot] <support@github.com>\n' +
               'PR-URL: https://github.com/nodejs/node/pull/1234\n' +
               'Reviewed-By: Bar <bar@example.com>'
    }, v)

    const reports = []
    context.report = (opts) => {
      reports.push(opts)
    }

    Rule.validate(context)

    // Should get 2 reports: warn for bot + pass for human
    t.assert.strictEqual(reports.length, 2, 'total reports')

    t.assert.strictEqual(reports[0].level, 'warn', 'bot is warn')
    t.assert.strictEqual(reports[0].message,
      '"Signed-off-by" must be from a human author, ' +
      'not a bot or AI agent', 'bot message')
    t.assert.match(reports[0].string,
      /dependabot\[bot\]/, 'bot string')

    t.assert.strictEqual(reports[1].level, 'pass', 'human passes')
    t.assert.strictEqual(reports[1].message,
      'has valid Signed-off-by', 'pass message')
    t.assert.strictEqual(reports[1].string, '', 'pass string')
  })
})
