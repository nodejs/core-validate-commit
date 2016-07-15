'use strict'

const test = require('tap').test
const Commit = require('./commit')

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

    module: fix resolution of filename with trailing slash

    A recent optimization of module loading performance [1] forgot to check that
    extensions were set in a certain code path.

    [1] https://github.com/nodejs/node/pull/5172/commits/ae18bbef48d87d9c641df85369f62cfd5ed8c250

    Fixes: https://github.com/nodejs/node/issues/6214
    PR-URL: https://github.com/nodejs/node/pull/6215
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Brian White <mscdex@mscdex.net>`
/* eslint-enable */

test('commit', (t) => {
  let c = new Commit(str)
  t.equal(c.sha, 'e7c077c610afa371430180fbd447bfef60ebc5ea', 'sha')
  t.equal(c.date, 'Tue Apr 12 15:42:23 2016 -0400', 'date')
  t.deepEqual(c.subsystems, ['stream'], 'subsystems')
  t.equal(c.pr, 'https://github.com/nodejs/node/pull/6170', 'pr')
  t.equal(c.errors.length, 1, 'errors.length')
  t.equal(c.errors[0].code, 'ETITLETOOLONG', 'code')
  t.equal(c.revert, false, 'revert')

  c = new Commit(str2)
  t.equal(c.sha, 'b6475b9a9d0da0971eec7eb5559dff4d18a0e721', 'sha')
  t.equal(c.date, 'Tue Mar 29 08:09:37 2016 -0500', 'date')
  t.deepEqual(c.subsystems, [], 'subsystems')
  t.equal(c.pr, 'https://github.com/nodejs/node/pull/5947', 'pr')
  t.equal(c.warnings.length, 0, 'warnings.length')
  t.equal(c.revert, true, 'revert')

  c = new Commit(str3)
  t.equal(c.sha, '75487f0db80e70a3e27fabfe323a33258dfbbea8', 'sha')
  t.equal(c.date, 'Fri Apr 15 13:32:36 2016 +0200', 'date')
  t.deepEqual(c.subsystems, ['module'], 'subsystems')
  t.equal(c.pr, 'https://github.com/nodejs/node/pull/6215', 'pr')
  t.equal(c.errors.length, 3, 'errors.length')
  t.equal(c.revert, false, 'revert')

  t.end()
})
