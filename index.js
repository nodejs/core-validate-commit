'use strict'

const exec = require('child_process').exec
const Commit = require('./commit')

module.exports = Validator

function Validator(opts) {
  if (!(this instanceof Validator))
    return new Validator(opts)

  this.opts = Object.assign({
    endRef: 'HEAD'
  }, opts)

  if (!this.opts.startRef && !this.opts.sha) {
    throw new Error('Either startRef or sha are required')
  }
}

Validator.prototype.validate = function validate(shas_, cb) {
  const shas = shas_.slice()
  const self = this
  const out = []

  ;(function run() {
    if (!shas.length) return cb(null, out)
    const sha = shas.shift()
    self.getCommit(sha, (err, res) => {
      if (err) return cb(err)
      out.push(res)
      run()
    })
  })()
}

Validator.prototype.getCommit = function getCommit(sha, cb) {
  exec(`git show --quiet ${sha}`, (err, stdout, stderr) => {
    if (err) return cb(err)
    const commit = new Commit(stdout)
    cb(null, commit)
  })
}

Validator.prototype.getShas = function getShas(cb) {
  if (this.opts.sha) {
    return setImmediate(() => {
      cb(null, [this.opts.sha])
    })
  }
  const cmd = `git rev-list ${this.opts.startRef}..${this.opts.endRef}`
  exec(cmd, (err, stdout, stderr) => {
    if (err) return cb(err)
    cb(null, stdout.trim().split('\n'))
  })
}
