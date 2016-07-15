'use strict'

module.exports = Commit

function Commit(str) {
  if (!(this instanceof Commit))
    return new Commit(str)

  this._raw = str
  this.sha = null
  this.title = null
  this.subsystems = []
  this.author = null
  this.date = null
  this.fixes = []
  this.pr = null
  this.reviewers = []
  this.description = null
  this.revert = false
  this.errors = []
  this.warnings = []
  this.parse()
}

const headingRE = /([^\:]+):([\s]+)(.*)/
const revertRE = /Revert "(.*)"$/
const workingRE = /Working on v([\d]+)\.([\d]+).([\d]+)$/
const releaseRE = /([\d]{4})-([\d]{2})-([\d]{2}),? Version/
const reviewedByRE = /Reviewed-By: (.*)/
const fixesRE = /Fixes: (.*)/
const prUrlRE = /PR-URL: (.*)/

const validSubsystems = [
  'benchmark'
, 'build'
, 'deps'
, 'doc'
, 'node'
, 'src'
, 'test'
, 'tools'

// core libs
, 'assert'
, 'async_wrap'
, 'buffer'
, 'child_process'
, 'cluster'
, 'console'
, 'constants'
, 'crypto'
, 'debugger'
, 'dgram'
, 'dns'
, 'domain'
, 'events'
, 'fs'
, 'http'
, 'https'
, 'module'
, 'net'
, 'os'
, 'path'
, 'process'
, 'punycode'
, 'querystring'
, 'readline'
, 'repl'
, 'stream'
, 'string_decoder'
, 'sys'
, 'timers'
, 'tls'
, 'tty'
, 'url'
, 'util'
, 'v8'
, 'vm'
, 'zlib'
]

Commit.prototype.parse = function parse() {
  const splits = this._raw.split('\n')
  const commitLine = splits.shift()
  let lineNum = 1
  this.sha = commitLine.replace('commit ', '')

  var line
  while (line = splits.shift()) {
    lineNum++
    line = line.trim()
    if (!line) break // stop on the first empty line
    const matches = line.match(headingRE)
    if (matches) {
      const key = matches[1].toLowerCase()
      const val = matches[3]
      if (key === 'date' || key === 'authordate') {
        this.date = val
      } else if (key === 'author') {
        this.author = val
      }
    }
  }

  const body = splits.map((item) => {
    if (item.length) return item.slice(4, item.length)
    return ''
  })

  this.title = body.shift()
  lineNum++

  const revert = this.isRevert()

  if (this.title.length > 50) {
    if (!revert) {
      this.error('ETITLETOOLONG', this.title, lineNum)
    }
  }

  const release = this.isReleaseCommit()

  if (!revert) {
    this.subsystems = getSubsystems(this.title)
  } else {
    this.revert = true
    // on validate, check that original commit sha is included
    // in commit message
  }

  if (this.subsystems.length) {
    for (let i = 0; i < this.subsystems.length; i++) {
      const sub = this.subsystems[i]
      if (!~validSubsystems.indexOf(sub)) {
        this.error('EINVALIDSUBSYSTEM', sub, lineNum)
      }
    }
  }

  const afterTitle = body.shift()
  lineNum++
  // check that it is a blank line
  if (afterTitle.trim()) {
    this.warn('Expected blank line after commit title.', afterTitle, lineNum)
  }

  for (let i = 0; i < body.length; i++) {
    const line = body[i]
    lineNum++
    if (line.length > 72 && !release) {
      this.error('ELINETOOLONG', line, lineNum)
    }

    const reviewedBy = line.match(reviewedByRE)
    if (reviewedBy) {
      if (!this.pr) {
        this.error('EMETAORDER', 'PR-URL should come before reviewers', lineNum)
      }
      this.reviewers.push(reviewedBy[1])
      continue
    }

    const fixes = line.match(fixesRE)
    if (fixes) {
      const f = fixes[1]
      if (f[0] === '#') {
        this.error('EINVALIDFIXESURL', line, lineNum)
      }
      this.fixes.push(f)
      continue
    }

    const prUrl = line.match(prUrlRE)
    if (prUrl) {
      this.pr = prUrl[1]
      if (this.pr[0] === '#') {
        this.error('EINVALIDPRURL', line, lineNum)
      }
      continue
    }
  }

  if (!this.author) {
    this.error('EMISSINGAUTHOR', 'Author not found', null)
  }

  if (!this.date) {
    this.error('EMISSINGDATE', 'Date not found', null)
  }

  if (!this.pr && !release) {
    this.error('EMISSINGPRURL', 'PR-URL Not found', null)
  }

  if (!this.reviewers.length && !release) {
    this.error('EMISSINGREVIEWERS', 'No reviewers found', null)
  }

  this.description = body.join('\n')
}

Commit.prototype.getLine = function getLine(idx) {
  return this._raw.split('\n')[idx]
}

Commit.prototype.error = function error(code, str, n) {
  this.errors.push({
    code: code
  , str: str
  , lineNum: n
  })
}

Commit.prototype.warn = function warn(code, str, n) {
  this.warnings.push({
    code: code
  , str: str
  , lineNum: n
  })
}

Commit.prototype.isRevert = function isRevert() {
  return revertRE.test(this.title)
}

Commit.prototype.isWorkingCommit = function isWorkingCommit() {
  return workingRE.test(this.title)
}

Commit.prototype.isReleaseCommit = function isReleaseCommit() {
  return releaseRE.test(this.title)
}

function getSubsystems(str) {
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

Commit.prototype.toJSON = function toJSON() {
  return {
    sha: this.sha
  , title: this.title
  , subsystems: this.subsystems
  , author: this.author
  , date: this.date
  , fixes: this.fixes
  , pr: this.pr
  , reviewers: this.reviewers
  , description: this.description
  , revert: this.revert
  }
}
