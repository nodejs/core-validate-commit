'use strict'

const EE = require('events')
const Parser = require('gitlint-parser-node')
const BaseRule = require('./rule')
const RULES = require('./rules')

module.exports = class ValidateCommit extends EE {
  constructor(options) {
    super()

    this.opts = Object.assign({
      'validate-metadata': true
    }, options)

    this.messages = new Map()
    this.errors = 0

    this.rules = new Map()
    this.loadBaseRules()
  }

  loadBaseRules() {
    const keys = Object.keys(RULES)
    for (const key of keys) {
      this.rules.set(key, new BaseRule(RULES[key]))
    }
    if (!this.opts['validate-metadata']) {
      this.disableRule('pr-url')
      this.disableRule('reviewers')
      this.disableRule('metadata-end')
    }
    this.disableRule('skip-fixup-squash')
  }

  disableRule(id) {
    if (!this.rules.has(id)) {
      throw new TypeError(`Invalid rule: "${id}"`)
    }

    this.rules.get(id).disabled = true
  }

  lint(str) {
    if (Array.isArray(str)) {
      for (const item of str) {
        this.lint(item)
      }
    } else {
      const commit = new Parser(str, this)
      if (commit.title.startsWith('fixup!') ||
          commit.title.startsWith('squash!')) {
        this.rules.get('skip-fixup-squash').validate(commit)
      } else {
        for (const rule of this.rules.values()) {
          if (rule.disabled) continue
          rule.validate(commit)
        }
      }

      setImmediate(() => {
        this.emit('commit', {
          commit: commit
        , messages: this.messages.get(commit.sha) || []
        })
      })
    }
  }

  report(opts) {
    const commit = opts.commit
    const sha = commit.sha
    if (!sha) {
      throw new Error('Invalid report. Missing commit sha')
    }

    if (opts.data.level === 'fail')
      this.errors++
    const ar = this.messages.get(sha) || []
    ar.push(opts.data)
    this.messages.set(sha, ar)
    setImmediate(() => {
      this.emit('message', opts)
    })
  }
}
