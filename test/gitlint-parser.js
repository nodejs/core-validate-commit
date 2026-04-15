import { test } from 'tap'
import Parser from '../lib/gitlint-parser.js'

test('Parser', (t) => {
  t.test('basic commit with PR-URL and reviewers', (tt) => {
    tt.plan(10)
    const input = `commit e7c077c610afa371430180fbd447bfef60ebc5ea
Author: Calvin Metcalf <cmetcalf@appgeo.com>
Date:   Tue Apr 12 15:42:23 2016 -0400

    stream: make null an invalid chunk to write in object mode

    this harmonizes behavior between readable, writable, and transform
    streams so that they all handle nulls in object mode the same way by
    considering them invalid chunks.

    PR-URL: https://github.com/nodejs/node/pull/6170
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Matteo Collina <matteo.collina@gmail.com>`

    const data = { name: 'biscuits' }

    const v = {
      report: (obj) => {
        tt.pass('called report')
        tt.equal(obj.data, data, 'obj')
      }
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, 'e7c077c610afa371430180fbd447bfef60ebc5ea', 'sha')
    tt.equal(c.author, 'Calvin Metcalf <cmetcalf@appgeo.com>', 'author')
    tt.equal(c.date, 'Tue Apr 12 15:42:23 2016 -0400', 'date')
    tt.deepEqual(c.subsystems, ['stream'], 'subsystems')
    tt.deepEqual(c.fixes, [], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/6170', 'prUrl')
    tt.deepEqual(c.reviewers, [
      'James M Snell <jasnell@gmail.com>',
      'Matteo Collina <matteo.collina@gmail.com>'
    ], 'reviewers')
    tt.deepEqual(c.metadata, {
      start: 5,
      end: 7
    }, 'metadata')
    p.report(data)
  })

  t.test('basic commit using format=fuller', (tt) => {
    tt.plan(9)
    const input = `commit e7c077c610afa371430180fbd447bfef60ebc5ea
Author:     Calvin Metcalf <cmetcalf@appgeo.com>
AuthorDate: Tue Apr 12 15:42:23 2016 -0400
Commit:     James M Snell <jasnell@gmail.com>
CommitDate: Tue Apr 12 15:42:23 2016 -0400

    stream: make null an invalid chunk to write in object mode

    this harmonizes behavior between readable, writable, and transform
    streams so that they all handle nulls in object mode the same way by
    considering them invalid chunks.

    PR-URL: https://github.com/nodejs/node/pull/6170
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Matteo Collina <matteo.collina@gmail.com>`

    const data = { name: 'biscuits' }

    const v = {
      report: (obj) => {
        tt.pass('called report')
        tt.equal(obj.data, data, 'obj')
      }
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, 'e7c077c610afa371430180fbd447bfef60ebc5ea', 'sha')
    tt.equal(c.author, 'Calvin Metcalf <cmetcalf@appgeo.com>', 'author')
    tt.equal(c.date, 'Tue Apr 12 15:42:23 2016 -0400', 'date')
    tt.deepEqual(c.subsystems, ['stream'], 'subsystems')
    tt.deepEqual(c.fixes, [], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/6170', 'prUrl')
    tt.deepEqual(c.reviewers, [
      'James M Snell <jasnell@gmail.com>',
      'Matteo Collina <matteo.collina@gmail.com>'
    ], 'reviewers')
    p.report(data)
  })

  t.test('revert commit', (tt) => {
    tt.plan(13)
    const input = `commit 1d4c7993a9c6dcacaca5074a80b1043e977c43fb
Author: Rod Vagg <rod@vagg.org>
Date:   Wed Jun 8 16:32:10 2016 +1000

    Revert "test: change duration_ms to duration"

    This reverts commit d413378e513c47a952f7979c74f4a4d9f144ca7d.

    PR-URL: https://github.com/nodejs/node/pull/7216
    Reviewed-By: Colin Ihrig <cjihrig@gmail.com>
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Michaël Zasso <mic.besace@gmail.com>
    Reviewed-By: Johan Bergström <bugs@bergstroem.nu>`
    const data = { name: 'biscuits' }

    const v = {
      report: (obj) => {
        tt.pass('called report')
        tt.equal(obj.data, data, 'obj')
      }
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, '1d4c7993a9c6dcacaca5074a80b1043e977c43fb', 'sha')
    tt.equal(c.author, 'Rod Vagg <rod@vagg.org>', 'author')
    tt.equal(c.date, 'Wed Jun 8 16:32:10 2016 +1000', 'date')
    tt.deepEqual(c.subsystems, ['test'], 'subsystems')
    tt.deepEqual(c.fixes, [], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/7216', 'prUrl')
    tt.deepEqual(c.reviewers, [
      'Colin Ihrig <cjihrig@gmail.com>',
      'James M Snell <jasnell@gmail.com>',
      'Michaël Zasso <mic.besace@gmail.com>',
      'Johan Bergström <bugs@bergstroem.nu>'
    ], 'reviewers')

    tt.equal(c.revert, true, 'revert')
    tt.equal(c.release, false, 'release')
    tt.equal(c.working, false, 'working')
    tt.deepEqual(c.metadata, {
      start: 3,
      end: 7
    }, 'metadata')
    p.report(data)
  })

  t.test('backport commit', (tt) => {
    const input = `commit 5cdbbdf94d6f656230293ddd2a71dedf11cab17d
Author: Ben Noordhuis <info@bnoordhuis.nl>
Date:   Thu Jul 7 14:29:32 2016 -0700

    deps: cherry-pick 1f53e42 from v8 upstream

    Original commit message:

        Handle symbols in FrameMirror#invocationText().

        Fix a TypeError when putting together the invocationText for a
        symbol method's stack frame.

        See https://github.com/nodejs/node/issues/7536.

        Review-Url: https://codereview.chromium.org/2122793003
        Cr-Commit-Position: refs/heads/master@{#37597}

    Fixes: https://github.com/nodejs/node/issues/7536
    PR-URL: https://github.com/nodejs/node/pull/7612
    Reviewed-By: Colin Ihrig <cjihrig@gmail.com>
    Reviewed-By: Michaël Zasso <mic.besace@gmail.com>`
    const data = { name: 'biscuits' }

    const v = {
      report: (obj) => {
        tt.pass('called report')
        tt.equal(obj.data, data, 'obj')
      }
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, '5cdbbdf94d6f656230293ddd2a71dedf11cab17d', 'sha')
    tt.equal(c.author, 'Ben Noordhuis <info@bnoordhuis.nl>', 'author')
    tt.equal(c.date, 'Thu Jul 7 14:29:32 2016 -0700', 'date')
    tt.deepEqual(c.subsystems, ['deps'], 'subsystems')
    tt.deepEqual(c.fixes, [
      'https://github.com/nodejs/node/issues/7536'
    ], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/7612', 'prUrl')
    tt.deepEqual(c.reviewers, [
      'Colin Ihrig <cjihrig@gmail.com>',
      'Michaël Zasso <mic.besace@gmail.com>'
    ], 'reviewers')

    tt.equal(c.revert, false, 'revert')
    tt.equal(c.release, false, 'release')
    tt.equal(c.working, false, 'working')
    tt.deepEqual(c.metadata, {
      start: 13,
      end: 16
    }, 'metadata')
    p.report(data)
    tt.end()
  })

  t.test('release commit', (tt) => {
    /* eslint-disable */
    const input = `commit 6a9438343bb63e2c1fc028f2e9387e6ae41b9fc8
Author: Evan Lucas <evanlucas@me.com>
Date:   Thu Jun 23 07:27:44 2016 -0500

    2016-06-23, Version 5.12.0 (Stable)

    Notable changes:

    This is a security release. All Node.js users should consult the security
    release summary at https://nodejs.org/en/blog/vulnerability/june-2016-security-releases
    for details on patched vulnerabilities.

    * **buffer**
      * backport allocUnsafeSlow (Сковорода Никита Андреевич) [#7169](https://github.com/nodejs/node/pull/7169)
      * ignore negative allocation lengths (Anna Henningsen) [#7221](https://github.com/nodejs/node/pull/7221)
    * **deps**: backport 3a9bfec from v8 upstream (Ben Noordhuis) [nodejs/node-private#40](https://github.com/nodejs/node-private/pull/40)
      * Fixes a Buffer overflow vulnerability discovered in v8. More details
        can be found in the CVE (CVE-2016-1699).

    PR-URL: https://github.com/nodejs/node-private/pull/51`
    /* eslint-enable */
    const v = {
      report: () => {}
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, '6a9438343bb63e2c1fc028f2e9387e6ae41b9fc8', 'sha')
    tt.equal(c.author, 'Evan Lucas <evanlucas@me.com>', 'author')
    tt.equal(c.date, 'Thu Jun 23 07:27:44 2016 -0500', 'date')
    tt.deepEqual(c.subsystems, [], 'subsystems')
    tt.deepEqual(c.fixes, [], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node-private/pull/51', 'prUrl')
    tt.deepEqual(c.reviewers, [], 'reviewers')
    tt.deepEqual(c.metadata, {
      start: 14,
      end: 14
    }, 'metadata')

    tt.equal(c.revert, false, 'revert')
    tt.equal(c.release, true, 'release')
    tt.equal(c.working, false, 'working')
    tt.end()
  })

  t.test('extra meta', (tt) => {
    /* eslint-disable */
    const input = {
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
      "message": "fs: fix handling of `uv_stat_t` fields\n\n`FChown` and `Chown` test that the `uid` and `gid` parameters\nthey receive are unsigned integers, but `Stat()` and `FStat()`\nwould return the corresponding fields of `uv_stat_t` as signed\nintegers. Applications which pass those these values directly\nto `Chown` may fail\n(e.g. for `nobody` on OS X, who has an `uid` of `-2`, see e.g.\nhttps://github.com/nodejs/node-v0.x-archive/issues/5890).\n\nThis patch changes the `Integer::New()` call for `uid` and `gid`\nto `Integer::NewFromUnsigned()`.\n\nAll other fields are kept as they are, for performance, but\nstrictly speaking the respective sizes of those\nfields aren’t specified, either.\n\nRef: https://github.com/npm/npm/issues/13918\nPR-URL: https://github.com/nodejs/node/pull/8515\nReviewed-By: Ben Noordhuis <info@bnoordhuis.nl>\nReviewed-By: Sakthipriyan Vairamani <thechargingvolcano@gmail.com>\nReviewed-By: James M Snell <jasnell@gmail.com>",
      "parents": [
        {
          "sha": "4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4",
          "url": "https://api.github.com/repos/nodejs/node/git/commits/4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4",
          "html_url": "https://github.com/nodejs/node/commit/4e76bffc0c7076a5901179e70c7b8a8f9fcd22e4"
        }
      ]
    }
    /* eslint-enable */
    const v = {
      report: () => {}
    }
    const p = new Parser(input, v)
    const c = p.toJSON()
    tt.equal(c.sha, 'c5545f2c63fe30b0cfcdafab18c26df8286881d0', 'sha')
    tt.equal(c.author, 'Anna Henningsen <anna@addaleax.net>', 'author')
    tt.equal(c.date, '2016-09-13T10:57:49Z', 'date')
    tt.deepEqual(c.subsystems, ['fs'], 'subsystems')
    tt.deepEqual(c.fixes, [], 'fixes')
    tt.equal(c.prUrl, 'https://github.com/nodejs/node/pull/8515', 'prUrl')
    tt.deepEqual(c.reviewers, [
      'Ben Noordhuis <info@bnoordhuis.nl>',
      'Sakthipriyan Vairamani <thechargingvolcano@gmail.com>',
      'James M Snell <jasnell@gmail.com>'
    ], 'reviewers')
    tt.deepEqual(c.metadata, {
      start: 16,
      end: 20
    }, 'metadata')
    tt.deepEqual(c.trailers, [
      'Ref: https://github.com/npm/npm/issues/13918',
      'PR-URL: https://github.com/nodejs/node/pull/8515',
      'Reviewed-By: Ben Noordhuis <info@bnoordhuis.nl>',
      'Reviewed-By: Sakthipriyan Vairamani <thechargingvolcano@gmail.com>',
      'Reviewed-By: James M Snell <jasnell@gmail.com>'
    ], 'c.trailers')
    tt.deepEqual(c.trailerFreeBody, [
      '`FChown` and `Chown` test that the `uid` and `gid` parameters',
      'they receive are unsigned integers, but `Stat()` and `FStat()`',
      'would return the corresponding fields of `uv_stat_t` as signed',
      'integers. Applications which pass those these values directly',
      'to `Chown` may fail',
      '(e.g. for `nobody` on OS X, who has an `uid` of `-2`, see e.g.',
      'https://github.com/nodejs/node-v0.x-archive/issues/5890).',
      '',
      'This patch changes the `Integer::New()` call for `uid` and `gid`',
      'to `Integer::NewFromUnsigned()`.',
      '',
      'All other fields are kept as they are, for performance, but',
      'strictly speaking the respective sizes of those',
      'fields aren’t specified, either.'
    ], 'c.trailerFreeBody')

    tt.equal(c.revert, false, 'revert')
    tt.equal(c.release, false, 'release')
    tt.equal(c.working, false, 'working')
    tt.end()
  })

  t.end()
})
