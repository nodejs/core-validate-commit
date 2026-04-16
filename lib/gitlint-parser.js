import { spawnSync } from 'node:child_process'
import Base from 'gitlint-parser-base'

const revertRE = /Revert "(.*)"$/
const workingRE = /Working on v([\d]+)\.([\d]+).([\d]+)$/
const releaseRE = /([\d]{4})-([\d]{2})-([\d]{2}),? Version/
const reviewedByRE = /^Reviewed-By: (.*)$/
const fixesRE = /^Fixes: (.*)$/
const prUrlRE = /^PR-URL: (.*)$/
const refsRE = /^Refs?: (.*)$/

export default class Parser extends Base {
  constructor (str, validator) {
    super(str, validator)
    this.subsystems = []
    this.fixes = []
    this.prUrl = null
    this.refs = []
    this.reviewers = []
    this._metaStart = 0
    this._metaEnd = 0
    this._parse()
  }

  _setMetaStart (n) {
    if (this._metaStart) return
    this._metaStart = n
  }

  _setMetaEnd (n) {
    if (n < this._metaEnd) return
    this._metaEnd = n
  }

  _parseTrailers (body) {
    const interpretTrailers = commitMessage => spawnSync('git', [
      'interpret-trailers', '--only-trailers', '--only-input', '--no-divider'
    ], {
      encoding: 'utf-8',
      input: `'dummy subject\n\n${commitMessage.join('\n')}\n`
    }).stdout

    let originalTrailers
    try {
      originalTrailers = interpretTrailers(body).trim()
    } catch (err) {
      console.warn('git is not available, trailers detection might be a bit ' +
                   'off which is acceptable in most cases', err)
      return body
    }
    const trailerFreeBody = body.slice(1) // clone, and remove the first empty line
    const stillInTrailers = () => {
      const result = interpretTrailers(trailerFreeBody)
      return result.length && originalTrailers.startsWith(result.trim())
    }
    for (let i = trailerFreeBody.length - 1; stillInTrailers(); i--) {
      // Remove last line until git no longer detects any trailers
      trailerFreeBody.pop()
    }
    this._metaStart = trailerFreeBody.length + 1 // the subject line needs to be counted
    for (let i = trailerFreeBody.length - 1; trailerFreeBody[i] === ''; i--) {
      // Remove additional empty line(s)
      trailerFreeBody.pop()
    }
    this._metaEnd = body.length - 1
    this.trailerFreeBody = trailerFreeBody
    return (this.trailers = originalTrailers.split('\n'))
  }

  _parse () {
    const revert = this.isRevert()
    if (!revert) {
      this.subsystems = getSubsystems(this.title || '')
    } else {
      const matches = this.title.match(revertRE)
      if (matches) {
        const title = matches[1]
        this.subsystems = getSubsystems(title)
      }
    }

    const trailers = this._parseTrailers(this.body)

    for (let i = 0; i < trailers.length; i++) {
      const line = trailers[i]
      const reviewedBy = reviewedByRE.exec(line)
      if (reviewedBy) {
        this._setMetaStart(i)
        this._setMetaEnd(i)
        this.reviewers.push(reviewedBy[1])
        continue
      }

      const fixes = fixesRE.exec(line)
      if (fixes) {
        this._setMetaStart(i)
        this._setMetaEnd(i)
        this.fixes.push(fixes[1])
        continue
      }

      const prUrl = prUrlRE.exec(line)
      if (prUrl) {
        this._setMetaStart(i)
        this._setMetaEnd(i)
        this.prUrl = prUrl[1]
        continue
      }

      const refs = refsRE.exec(line)
      if (refs) {
        this._setMetaStart(i)
        this._setMetaEnd(i)
        this.refs.push(refs[1])
        continue
      }

      if (this._metaStart && !this._metaEnd) { this._setMetaEnd(i) }
    }
  }

  isRevert () {
    return revertRE.test(this.title)
  }

  isWorkingCommit () {
    return workingRE.test(this.title)
  }

  isReleaseCommit () {
    return releaseRE.test(this.title)
  }

  toJSON () {
    return {
      sha: this.sha,
      title: this.title,
      subsystems: this.subsystems,
      author: this.author,
      date: this.date,
      fixes: this.fixes,
      refs: this.refs,
      prUrl: this.prUrl,
      reviewers: this.reviewers,
      body: this.body,
      trailers: this.trailers,
      trailerFreeBody: this.trailerFreeBody,
      revert: this.isRevert(),
      release: this.isReleaseCommit(),
      working: this.isWorkingCommit(),
      metadata: {
        start: this._metaStart,
        end: this._metaEnd
      }
    }
  }
}

function getSubsystems (str) {
  str = str || ''
  const colon = str.indexOf(':')
  if (colon === -1) {
    return []
  }

  const subStr = str.slice(0, colon)
  const subs = subStr.split(',')
  return subs.map((item) => {
    return item.trim()
  })
}
