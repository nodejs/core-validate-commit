'use strict'

const test = require('tap').test
const Rule = require('../../lib/rules/fixes-url')
const Commit = require('gitlint-parser-node')
const Validator = require('../../')

const INVALID_PRURL = 'Pull request URL must reference a comment or discussion.'
const NOT_AN_ISSUE_NUMBER = 'Fixes must be a URL, not an issue number.'
const NOT_A_GITHUB_URL = 'Fixes must be a GitHub URL.'
const VALID_FIXES_URL = 'Valid fixes URL.'

const makeCommit = (msg) => {
  return new Commit({
    sha: 'e7c077c610afa371430180fbd447bfef60ebc5ea'
  , author: {
      name: 'Evan Lucas'
    , email: 'evanlucas@me.com'
    , date: '2016-04-12T19:42:23Z'
    }
  , message: msg
  }, new Validator())
}

test('rule: fixes-url', (t) => {
  t.test('issue number', (tt) => {
    tt.plan(7)
    const context = makeCommit(`test: fix something

Fixes: #1234`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, NOT_AN_ISSUE_NUMBER, 'message')
      tt.equal(opts.string, '#1234', 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('GitHub issue URL', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/issues/1234'
    const context = makeCommit(`test: fix something

Fixes: ${url}`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, VALID_FIXES_URL, 'message')
      tt.equal(opts.string, url, 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('GitHub issue URL with comment', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/issues/1234#issuecomment-1234'
    const context = makeCommit(`test: fix something

Fixes: ${url}`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, VALID_FIXES_URL, 'message')
      tt.equal(opts.string, url, 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('GitHub PR URL', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/pull/1234'
    const context = makeCommit(`test: fix something

Fixes: ${url}`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, INVALID_PRURL, 'message')
      tt.equal(opts.string, url, 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.test('GitHub PR URL with comment', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/pull/1234#issuecomment-1234'
    const context = makeCommit(`test: fix something

Fixes: ${url}`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, VALID_FIXES_URL, 'message')
      tt.equal(opts.string, url, 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('GitHub PR URL with discussion comment', (tt) => {
    tt.plan(7)
    const url = 'https://github.com/nodejs/node/pull/1234#discussion_r1234'
    const context = makeCommit(`test: fix something

Fixes: ${url}`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, VALID_FIXES_URL, 'message')
      tt.equal(opts.string, url, 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'pass', 'level')
    }

    Rule.validate(context)
  })

  t.test('non-GitHub URL', (tt) => {
    tt.plan(7)
    const context = makeCommit(`test: fix something

Fixes: https://nodejs.org`
    )

    context.report = (opts) => {
      tt.pass('called report')
      tt.equal(opts.id, 'fixes-url', 'id')
      tt.equal(opts.message, NOT_A_GITHUB_URL, 'message')
      tt.equal(opts.string, 'https://nodejs.org', 'string')
      tt.equal(opts.line, 1, 'line')
      tt.equal(opts.column, 7, 'column')
      tt.equal(opts.level, 'fail', 'level')
    }

    Rule.validate(context)
  })

  t.end()
})
