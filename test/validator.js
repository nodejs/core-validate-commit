'use strict'

const test = require('tap').test
const Validator = require('../')

// Note, these are not necessarily all real commit messages
const str = `commit e7c077c610afa371430180fbd447bfef60ebc5ea
Author:     Calvin Metcalf <cmetcalf@appgeo.com>
AuthorDate: Tue Apr 12 15:42:23 2016 -0400
Commit:     James M Snell <jasnell@gmail.com>
CommitDate: Wed Apr 20 13:28:35 2016 -0700

    stream: make null an invalid chunk to write in object mode

    this harmonizes behavior between readable, writable, and transform
    streams so that they all handle nulls in object mode the same way by
    considering them invalid chunks.

    PR-URL: https://github.com/nodejs/node/pull/6170
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Matteo Collina <matteo.collina@gmail.com>
`

const str2 = `commit b6475b9a9d0da0971eec7eb5559dff4d18a0e721
Author: Evan Lucas <evanlucas@me.com>
Date:   Tue Mar 29 08:09:37 2016 -0500

    Revert "tty: don't read from console stream upon creation"

    This reverts commit 461138929498f31bd35bea61aa4375a2f56cceb7.

    The offending commit broke certain usages of piping from stdin.

    Fixes: https://github.com/nodejs/node/issues/5927
    PR-URL: https://github.com/nodejs/node/pull/5947
    Reviewed-By: Matteo Collina <matteo.collina@gmail.com>
    Reviewed-By: Alexis Campailla <orangemocha@nodejs.org>
    Reviewed-By: Colin Ihrig <cjihrig@gmail.com>
`

/* eslint-disable */
const str3 = `commit 75487f0db80e70a3e27fabfe323a33258dfbbea8
Author: Michaël Zasso <targos@protonmail.com>
Date:   Fri Apr 15 13:32:36 2016 +0200

    module: fix resolution of filename with trailing slash - make this tile too long

    A recent optimization of module loading performance [1] forgot to check that
    extensions were set in a certain code path.

    [1] https://github.com/nodejs/node/pull/5172/commits/ae18bbef48d87d9c641df85369f62cfd5ed8c250

    Fixes: https://github.com/nodejs/node/issues/6214
    PR-URL: https://github.com/nodejs/node/pull/6215
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Brian White <mscdex@mscdex.net>`
/* eslint-enable */

const str4 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    check memoryUsage properties
    The properties on memoryUsage were not checked before,
    this commit checks them.

    PR-URL: #5546
    Reviewed-By: Colin Ihrig <cjihrig@gmail.com>`

const str5 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: check memoryUsage properties

    The properties on memoryUsage were not checked before,
    this commit checks them.`

/* eslint-disable */
const str6 = {
  "sha": "c5545f2c63fe30b0cfcdafab18c26df8286881d0",
  "url": "https://api.github.com/repos/nodejs/node/git/commits/c5545f2c63fe30b0cfcdafab18c26df8286881d0",
  "html_url": "https://github.com/nodejs/node/commit/c5545f2c63fe30b0cfcdafab18c26df8286881d0",
  "author": {
    "name": "Anna Henningsen",
    "email": "anna@addaleax.net",
    "date": "2016-09-13T10:57:49Z"
  },
  "committer": {
    "name": "Anna Henningsen",
    "email": "anna@addaleax.net",
    "date": "2016-09-19T12:50:57Z"
  },
  "tree": {
    "sha": "b505c0ffa0555730e9f4cdb391d1ebeb48bb2f59",
    "url": "https://api.github.com/repos/nodejs/node/git/trees/b505c0ffa0555730e9f4cdb391d1ebeb48bb2f59"
  },
  "message": "fs: fix handling of `uv_stat_t` fields\n\n`FChown` and `Chown` test that the `uid` and `gid` parameters\nthey receive are unsigned integers, but `Stat()` and `FStat()`\nwould return the corresponding fields of `uv_stat_t` as signed\nintegers. Applications which pass those these values directly\nto `Chown` may fail\n(e.g. for `nobody` on OS X, who has an `uid` of `-2`, see e.g.\nhttps://github.com/nodejs/node-v0.x-archive/issues/5890).\n\nThis patch changes the `Integer::New()` call for `uid` and `gid`\nto `Integer::NewFromUnsigned()`.\n\nAll other fields are kept as they are, for performance, but\nstrictly speaking the respective sizes of those\nfields aren’t specified, either.\n\nRef: https://github.com/npm/npm/issues/13918\nPR-URL: https://github.com/nodejs/node/pull/8515\nReviewed-By: Ben Noordhuis <info@bnoordhuis.nl>\nReviewed-By: Sakthipriyan Vairamani <thechargingvolcano@gmail.com>\nReviewed-By: James M Snell <jasnell@gmail.com>\n\nundo accidental change to other fields of uv_fs_stat",
  "parents": [
    {
      "sha": "4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4",
      "url": "https://api.github.com/repos/nodejs/node/git/commits/4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4",
      "html_url": "https://github.com/nodejs/node/commit/4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4"
    }
  ]
}
/* eslint-enable */

const str7 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: check memoryUsage properties.
`

const str8 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: Check memoryUsage properties
`

const str9 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: Check memoryUsage properties.
`

test('Validator - misc', (t) => {
  const v = new Validator()

  t.throws(() => {
    v.disableRule('biscuits')
  }, /Invalid rule: "biscuits"/)

  v.disableRule('line-length')
  t.equal(v.rules.get('line-length').disabled, true, 'disabled')
  v.rules.get('line-length').disabled = false

  t.end()
})

test('Validator - real commits', (t) => {
  t.test('basic', (tt) => {
    tt.plan(21)
    const v = new Validator()
    // run against the output of git show --quiet
    // run against the output of github's get commit api request
    // run against the output of github's list commits for pr api request
    v.lint(str)
    v.lint(require('./fixtures/commit'))
    v.lint(require('./fixtures/pr'))
    v.on('commit', (data) => {
      const c = data.commit
      tt.equal(c.sha, 'e7c077c610afa371430180fbd447bfef60ebc5ea', 'sha')
      tt.deepEqual(c.subsystems, ['stream'], 'subsystems')
      tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/6170', 'pr')
      const msgs = data.messages
      const failed = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(failed.length, 0, 'failed.length')
      const warned = msgs.filter((item) => {
        return item.level === 'warn'
      })
      tt.equal(warned.length, 3, 'warned.length')
      tt.equal(warned[0].level, 'warn')
      tt.equal(warned[0].id, 'title-length')
    })
  })

  t.test('basic revert', (tt) => {
    const v = new Validator()
    v.lint(str2)
    v.on('commit', (data) => {
      const c = data.commit.toJSON()
      tt.equal(c.sha, 'b6475b9a9d0da0971eec7eb5559dff4d18a0e721', 'sha')
      tt.equal(c.date, 'Tue Mar 29 08:09:37 2016 -0500', 'date')
      tt.deepEqual(c.subsystems, ['tty'], 'subsystems')
      tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/5947', 'pr')
      tt.equal(c.revert, true, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'warn'
      })
      tt.equal(filtered.length, 1, 'messages.length')
      tt.equal(filtered[0].level, 'warn')
      tt.equal(filtered[0].id, 'title-length')
      tt.end()
    })
  })

  t.test('more basic', (tt) => {
    const v = new Validator()
    v.lint(str3)
    v.on('commit', (data) => {
      const c = data.commit.toJSON()
      tt.equal(c.sha, '75487f0db80e70a3e27fabfe323a33258dfbbea8', 'sha')
      tt.equal(c.date, 'Fri Apr 15 13:32:36 2016 +0200', 'date')
      tt.deepEqual(c.subsystems, ['module'], 'subsystems')
      tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/6215', 'pr')
      tt.equal(c.revert, false, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 2, 'messages.length')
      const ids = filtered.map((item) => {
        return item.id
      })
      const exp = ['line-length', 'title-length']
      tt.deepEqual(ids.sort(), exp.sort(), 'message ids')
      tt.end()
    })
  })

  t.test('invalid pr-url, missing subsystem', (tt) => {
    const v = new Validator()
    v.lint(str4)
    v.on('commit', (data) => {
      const c = data.commit.toJSON()
      tt.equal(c.sha, '7d3a7ea0d7df9b6f11df723dec370f49f4f87e99', 'sha')
      tt.equal(c.date, 'Thu Mar 3 10:10:46 2016 -0600', 'date')
      tt.deepEqual(c.subsystems, [], 'subsystems')
      tt.equal(c.prUrl, '#5546', 'pr')
      tt.equal(c.revert, false, 'revert')
      const msgs = data.messages
      msgs.sort((a, b) => {
        return a.id < b.id
          ? -1
          : a.id > b.id
            ? 1
            : 0
      })
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 3, 'messages.length')
      tt.equal(filtered[0].id, 'line-after-title', 'message id')
      tt.equal(filtered[1].id, 'pr-url', 'message id')
      tt.equal(filtered[1].string, '#5546', 'message string')
      tt.equal(filtered[2].id, 'subsystem', 'message id')
      tt.equal(filtered[2].line, 0, 'line')
      tt.equal(filtered[2].column, 0, 'column')
      tt.end()
    })
  })

  t.test('invalid pr-url, missing subsystem no meta', (tt) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str5)
    v.on('commit', (data) => {
      const c = data.commit.toJSON()
      tt.equal(c.sha, '7d3a7ea0d7df9b6f11df723dec370f49f4f87e99', 'sha')
      tt.equal(c.date, 'Thu Mar 3 10:10:46 2016 -0600', 'date')
      tt.deepEqual(c.subsystems, ['test'], 'subsystems')
      tt.equal(c.prUrl, null, 'pr')
      tt.equal(c.revert, false, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 0, 'messages.length')
      tt.end()
    })
  })

  t.test('non empty lines after metadata', (tt) => {
    const v = new Validator()
    v.lint(str6)
    v.on('commit', (data) => {
      const c = data.commit.toJSON()
      tt.equal(c.sha, 'c5545f2c63fe30b0cfcdafab18c26df8286881d0', 'sha')
      tt.equal(c.date, '2016-09-13T10:57:49Z', 'date')
      tt.deepEqual(c.subsystems, ['fs'], 'subsystems')
      tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/8515', 'pr')
      tt.equal(c.revert, false, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 1, 'messages.length')
      const item = filtered[0]
      tt.equal(item.id, 'metadata-end', 'id')
      tt.equal(item.message, 'commit metadata at end of message', 'message')
      tt.equal(item.line, 22, 'line')
      tt.equal(item.column, 0, 'column')
      tt.end()
    })
  })

  t.test('trailing punctuation in title line', (tt) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str7)
    v.on('commit', (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 1, 'messages.length')
      tt.equal(filtered[0].message,
               'Do not use punctuation at end of title.',
               'message')
      tt.end()
    })
  })

  t.test('first word is lowercase in title line', (tt) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str8)
    v.on('commit', (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 1, 'messages.length')
      tt.equal(filtered[0].message,
               'First word after subsystem(s) in title should be lowercase.',
               'message')
      tt.equal(filtered[0].column, 7, 'column')
      tt.end()
    })
  })

  t.test('more than one formatting error in title line', (tt) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str9)
    v.on('commit', (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      tt.equal(filtered.length, 2, 'messages.length')
      tt.end()
    })
  })

  t.end()
})
