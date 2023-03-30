import EE from 'node:events'
import Parser from 'gitlint-parser-node'
import BaseRule from './rule.js'

// Rules
import coAuthoredByIsTrailer from './rules/co-authored-by-is-trailer.js'
import fixesUrl from './rules/fixes-url.js'
import lineAfterTitle from './rules/line-after-title.js'
import lineLength from './rules/line-length.js'
import metadataEnd from './rules/metadata-end.js'
import prUrl from './rules/pr-url.js'
import reviewers from './rules/reviewers.js'
import subsystem from './rules/subsystem.js'
import titleFormat from './rules/title-format.js'
import titleLength from './rules/title-length.js'

const RULES = {
  'co-authored-by-is-trailer': coAuthoredByIsTrailer,
  'fixes-url': fixesUrl,
  'line-after-title': lineAfterTitle,
  'line-length': lineLength,
  'metadata-end': metadataEnd,
  'pr-url': prUrl,
  reviewers,
  subsystem,
  'title-format': titleFormat,
  'title-length': titleLength
}

export default class ValidateCommit extends EE {
  constructor (options) {
    super()

    this.opts = Object.assign({
      'validate-metadata': true
    }, options)

    this.messages = new Map()
    this.errors = 0

    this.rules = new Map()
    this.loadBaseRules()
  }

  loadBaseRules () {
    const keys = Object.keys(RULES)
    for (const key of keys) {
      this.rules.set(key, new BaseRule(RULES[key]))
    }
    if (!this.opts['validate-metadata']) {
      this.disableRule('pr-url')
      this.disableRule('reviewers')
      this.disableRule('metadata-end')
    }
  }

  disableRule (id) {
    if (!this.rules.has(id)) {
      throw new TypeError(`Invalid rule: "${id}"`)
    }

    this.rules.get(id).disabled = true
  }

  lint (str) {
    if (Array.isArray(str)) {
      for (const item of str) {
        this.lint(item)
      }
    } else {
      const commit = new Parser(str, this)
      for (const rule of this.rules.values()) {
        if (rule.disabled) continue
        rule.validate(commit)
      }

      setImmediate(() => {
        this.emit('commit', {
          commit,
          messages: this.messages.get(commit.sha) || []
        })
      })
    }
  }

  report (opts) {
    const commit = opts.commit
    const sha = commit.sha
    if (!sha) {
      throw new Error('Invalid report. Missing commit sha')
    }

    if (opts.data.level === 'fail') { this.errors++ }
    const ar = this.messages.get(sha) || []
    ar.push(opts.data)
    this.messages.set(sha, ar)
    setImmediate(() => {
      this.emit('message', opts)
    })
  }
}
