import { describe, test } from 'node:test'
import Validator from '../lib/validator.js'
import { readFileSync } from 'node:fs'

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

    Signed-off-by: Calvin Metcalf <cmetcalf@appgeo.com>
    PR-URL: https://github.com/nodejs/node/pull/6170
    Reviewed-By: James M Snell <jasnell@gmail.com>
    Reviewed-By: Matteo Collina <matteo.collina@gmail.com>
`

const str2 = `commit b6475b9a9d0da0971eec7eb5559dff4d18a0e721
Author: Evan Lucas <evanlucas@me.com>
Date:   Tue Mar 29 08:09:37 2016 -0500

    Revert "tty: do not read from the console stream upon creation"

    This reverts commit 461138929498f31bd35bea61aa4375a2f56cceb7.

    The offending commit broke certain usages of piping from stdin.

    Fixes: https://github.com/nodejs/node/issues/5927
    Signed-off-by: Evan Lucas <evanlucas@me.com>
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
    Signed-off-by: Michaël Zasso <targos@protonmail.com>
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

    Signed-off-by: Wyatt Preul <wpreul@gmail.com>
    PR-URL: #5546
    Reviewed-By: Colin Ihrig <cjihrig@gmail.com>`

const str5 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: check memoryUsage properties

    The properties on memoryUsage were not checked before,
    this commit checks them.

    Signed-off-by: Wyatt Preul <wpreul@gmail.com>`

/* eslint-enable */

const str7 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: check memoryUsage properties.

    Signed-off-by: Wyatt Preul <wpreul@gmail.com>
`

const str8 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: Check memoryUsage properties

    Signed-off-by: Wyatt Preul <wpreul@gmail.com>
`

const str9 = `commit 7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
Author: Wyatt Preul <wpreul@gmail.com>
Date:   Thu Mar 3 10:10:46 2016 -0600

    test: Check memoryUsage properties.

    Signed-off-by: Wyatt Preul <wpreul@gmail.com>
`

const str10 = `commit b04fe688d5859f707cf1a5e0206967268118bf7a
Author: Darshan Sen <raisinten@gmail.com>
Date:   Sun May 1 21:10:21 2022 +0530

    Revert "bootstrap: delay the instantiation of maps in per-context scripts"

    The linked issue, https://bugs.chromium.org/p/v8/issues/detail?id=6593,
    is marked as "Fixed", so I think we can revert this now.

    This reverts commit 08a9c4a996964aca909cd75fa8ecafd652c54885.

    Signed-off-by: Darshan Sen <raisinten@gmail.com>
    PR-URL: https://github.com/nodejs/node/pull/42934
    Refs: https://bugs.chromium.org/p/v8/issues/detail?id=9187
    Reviewed-By: Joyee Cheung <joyeec9h3@gmail.com>
    Reviewed-By: Antoine du Hamel <duhamelantoine1995@gmail.com>
`

const str11 = `commit b04fe688d5859f707cf1a5e0206967268118bf7a
Author: Darshan Sen <raisinten@gmail.com>
Date:   Sun May 1 21:10:21 2022 +0530

    Revert "bootstrap: delay the instantiation of all maps in the per-context scripts"

    The linked issue, https://bugs.chromium.org/p/v8/issues/detail?id=6593,
    is marked as "Fixed", so I think we can revert this now.

    This reverts commit 08a9c4a996964aca909cd75fa8ecafd652c54885.

    Signed-off-by: Darshan Sen <raisinten@gmail.com>
    PR-URL: https://github.com/nodejs/node/pull/42934
    Refs: https://bugs.chromium.org/p/v8/issues/detail?id=9187
    Reviewed-By: Joyee Cheung <joyeec9h3@gmail.com>
    Reviewed-By: Antoine du Hamel <duhamelantoine1995@gmail.com>
`

const str12 = `commit cbb404503c9df13aaeb3dd8b345cb3f34c8c07e4
Author: Michaël Zasso <targos@protonmail.com>
Date:   Sat Oct 22 10:22:43 2022 +0200

    Revert "deps: V8: forward declaration of \`Rtl*FunctionTable\`"

    This reverts commit 01bc8e6fd81314e76c7fb0d09e5310f609e48bee.

    Signed-off-by: Michaël Zasso <targos@protonmail.com>
`

function waitForCommits (validator, count, callback) {
  return new Promise((resolve, reject) => {
    const onCommit = (data) => {
      try {
        callback(data)
        if (--count === 0) {
          validator.removeListener('commit', onCommit)
          resolve()
        }
      } catch (error) {
        validator.removeListener('commit', onCommit)
        reject(error)
      }
    }

    validator.on('commit', onCommit)
  })
}

test('Validator - misc', (t) => {
  const v = new Validator()

  t.assert.throws(() => {
    v.disableRule('biscuits')
  }, /Invalid rule: "biscuits"/)

  v.disableRule('line-length')
  t.assert.strictEqual(v.rules.get('line-length').disabled, true, 'disabled')
  v.rules.get('line-length').disabled = false
})

describe('Validator - real commits', () => {
  test('basic', async (t) => {
    const commit = JSON.parse(readFileSync(new URL('fixtures/commit.json', import.meta.url), { encoding: 'utf8' }))
    const pr = JSON.parse(readFileSync(new URL('fixtures/pr.json', import.meta.url), { encoding: 'utf8' }))
    t.plan(21)
    const v = new Validator()
    // run against the output of git show --quiet
    // run against the output of github's get commit api request
    // run against the output of github's list commits for pr api request
    v.lint(str)
    v.lint(commit)
    v.lint(pr)
    await waitForCommits(v, 3, (data) => {
      const c = data.commit
      t.assert.strictEqual(c.sha, 'e7c077c610afa371430180fbd447bfef60ebc5ea', 'sha')
      t.assert.deepStrictEqual(c.subsystems, ['stream'], 'subsystems')
      t.assert.strictEqual(c.prUrl, 'https://github.com/nodejs/node/pull/6170', 'pr')
      const msgs = data.messages
      const failed = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(failed.length, 0, 'failed.length')
      const warned = msgs.filter((item) => {
        return item.level === 'warn'
      })
      t.assert.strictEqual(warned.length, 3, 'warned.length')
      t.assert.strictEqual(warned[0].level, 'warn')
      t.assert.strictEqual(warned[0].id, 'title-length')
    })
  })

  test('basic revert', async (t) => {
    const v = new Validator()
    v.lint(str2)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, 'b6475b9a9d0da0971eec7eb5559dff4d18a0e721', 'sha')
      t.assert.strictEqual(c.date, 'Tue Mar 29 08:09:37 2016 -0500', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['tty'], 'subsystems')
      t.assert.strictEqual(c.prUrl, 'https://github.com/nodejs/node/pull/5947', 'pr')
      t.assert.strictEqual(c.revert, true, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'warn'
      })
      t.assert.strictEqual(filtered.length, 1, 'messages.length')
      t.assert.strictEqual(filtered[0].level, 'warn')
      t.assert.strictEqual(filtered[0].id, 'title-length')
    })
  })

  test('more basic', async (t) => {
    const v = new Validator()
    v.lint(str3)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, '75487f0db80e70a3e27fabfe323a33258dfbbea8', 'sha')
      t.assert.strictEqual(c.date, 'Fri Apr 15 13:32:36 2016 +0200', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['module'], 'subsystems')
      t.assert.strictEqual(c.prUrl, 'https://github.com/nodejs/node/pull/6215', 'pr')
      t.assert.strictEqual(c.revert, false, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 2, 'messages.length')
      const ids = filtered.map((item) => {
        return item.id
      })
      const exp = ['line-length', 'title-length']
      t.assert.deepStrictEqual(ids.sort(), exp.sort(), 'message ids')
    })
  })

  test('accept revert commit titles that are elongated by git', async (t) => {
    const v = new Validator()
    v.lint(str10)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, 'b04fe688d5859f707cf1a5e0206967268118bf7a', 'sha')
      t.assert.strictEqual(c.date, 'Sun May 1 21:10:21 2022 +0530', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['bootstrap'], 'subsystems')
      t.assert.strictEqual(c.prUrl, 'https://github.com/nodejs/node/pull/42934', 'pr')
      t.assert.strictEqual(c.revert, true, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.deepStrictEqual(filtered, [], 'messages.length')
    })
  })

  test('reject revert commit titles whose original titles are really long', async (t) => {
    const v = new Validator()
    v.lint(str11)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, 'b04fe688d5859f707cf1a5e0206967268118bf7a', 'sha')
      t.assert.strictEqual(c.date, 'Sun May 1 21:10:21 2022 +0530', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['bootstrap'], 'subsystems')
      t.assert.strictEqual(c.prUrl, 'https://github.com/nodejs/node/pull/42934', 'pr')
      t.assert.strictEqual(c.revert, true, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 1, 'messages.length')
      const ids = filtered.map((item) => {
        return item.id
      })
      const exp = ['title-length']
      t.assert.deepStrictEqual(ids.sort(), exp.sort(), 'message ids')
    })
  })

  test('accept deps: V8 as the subsystem for revert commits', async (t) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str12)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, 'cbb404503c9df13aaeb3dd8b345cb3f34c8c07e4', 'sha')
      t.assert.strictEqual(c.date, 'Sat Oct 22 10:22:43 2022 +0200', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['deps'], 'subsystems')
      t.assert.strictEqual(c.revert, true, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 0, 'messages.length')
    })
  })

  test('invalid pr-url, missing subsystem', async (t) => {
    const v = new Validator()
    v.lint(str4)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, '7d3a7ea0d7df9b6f11df723dec370f49f4f87e99', 'sha')
      t.assert.strictEqual(c.date, 'Thu Mar 3 10:10:46 2016 -0600', 'date')
      t.assert.deepStrictEqual(c.subsystems, [], 'subsystems')
      t.assert.strictEqual(c.prUrl, '#5546', 'pr')
      t.assert.strictEqual(c.revert, false, 'revert')
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
      t.assert.strictEqual(filtered.length, 3, 'messages.length')
      t.assert.strictEqual(filtered[0].id, 'line-after-title', 'message id')
      t.assert.strictEqual(filtered[1].id, 'pr-url', 'message id')
      t.assert.strictEqual(filtered[1].string, '#5546', 'message string')
      t.assert.strictEqual(filtered[2].id, 'subsystem', 'message id')
      t.assert.strictEqual(filtered[2].line, 0, 'line')
      t.assert.strictEqual(filtered[2].column, 0, 'column')
    })
  })

  test('invalid pr-url, missing subsystem no meta', async (t) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str5)
    await waitForCommits(v, 1, (data) => {
      const c = data.commit.toJSON()
      t.assert.strictEqual(c.sha, '7d3a7ea0d7df9b6f11df723dec370f49f4f87e99', 'sha')
      t.assert.strictEqual(c.date, 'Thu Mar 3 10:10:46 2016 -0600', 'date')
      t.assert.deepStrictEqual(c.subsystems, ['test'], 'subsystems')
      t.assert.strictEqual(c.prUrl, null, 'pr')
      t.assert.strictEqual(c.revert, false, 'revert')
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 0, 'messages.length')
    })
  })

  test('trailing punctuation in title line', async (t) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str7)
    await waitForCommits(v, 1, (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 1, 'messages.length')
      t.assert.strictEqual(filtered[0].message,
        'Do not use punctuation at end of title.',
        'message')
    })
  })

  test('first word is lowercase in title line', async (t) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str8)
    await waitForCommits(v, 1, (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 1, 'messages.length')
      t.assert.strictEqual(filtered[0].message,
        'First word after subsystem(s) in title should be lowercase.',
        'message')
      t.assert.strictEqual(filtered[0].column, 7, 'column')
    })
  })

  test('more than one formatting error in title line', async (t) => {
    const v = new Validator({
      'validate-metadata': false
    })
    v.lint(str9)
    await waitForCommits(v, 1, (data) => {
      const msgs = data.messages
      const filtered = msgs.filter((item) => {
        return item.level === 'fail'
      })
      t.assert.strictEqual(filtered.length, 2, 'messages.length')
    })
  })
})
