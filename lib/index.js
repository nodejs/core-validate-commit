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
    }
  }

  disableRule(id) {
    if (!this.rules.has(id)) {
      throw new TypeError(`Invalid rule: "${id}"`)
    }

    this.rules.get(id).disabled = true
  }

  loadCustomRule(config) {
    if (!config || typeof config !== 'object') {
      throw new TypeError('rule must be an object')
    }

    const rule = new BaseRule(config)
    this.rules.set(rule.id, rule)
  }

  loadRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new TypeError('rules must be an object')
    }

    const keys = Object.keys(rules)
    for (const id of keys) {
      const val = rules[id]
      if (this.rules.has(id)) {
        this.rules.get(id).options = val
      } else {
        const err = new Error(`Invalid rule: ${id}`)
        err.code = 'ENOTFOUND'
        return setImmediate(() => {
          this.emit('error', err)
        })
      }
    }
  }

  lint(str) {
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

    if (opts.data.level === 'error')
      this.errors++
    const ar = this.messages.get(sha) || []
    ar.push(opts.data)
    this.messages.set(sha, ar)
    setImmediate(() => {
      this.emit('message', opts)
    })
  }
}
