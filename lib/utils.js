'use strict'

const fs = require('fs')
const exec = require('child_process').exec
const http = require('http')
const https = require('https')
const url = require('url')
const formatTap = require('../lib/format-tap')
const Tap = require('../lib/tap')
const pretty = require('../lib/format-pretty')
const chalk = require('chalk')
const CHECK = chalk.green('✔')
const X = chalk.red('✖')
const WARN = chalk.yellow('⚠')

exports.CHECK = CHECK
exports.X = X
exports.WARN = WARN

exports.rightPad = function rightPad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${str}${' '.repeat(diff)}`
  }
  return str
}

exports.leftPad = function leftPad(str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${' '.repeat(diff)}${str}`
  }
  return str
}

exports.header = (sha, status) => {
  switch (status) {
    case 'skip':
    case 'pass':
      const suffix = status === 'skip'
        ? ' # SKIPPED'
        : ''
      return `${CHECK}  ${chalk.underline(sha)}${suffix}`
    case 'fail':
      return `${X}  ${chalk.underline(sha)}`
  }
}

exports.describeRule = function describeRule(rule, max = 20) {
  if (rule.meta && rule.meta.description) {
    const desc = rule.meta.description
    const title = exports.leftPad(rule.id, max)
    console.log(' %s %s', chalk.red(title), chalk.dim(desc))
  }
}

exports.describeSubsystem = function describeSubsystem(subsystems, max = 20) {
  if (subsystems) {
    for (let sub = 0; sub < subsystems.length; sub = sub + 3) {
      console.log('%s %s %s',
                  chalk.green(exports.leftPad(subsystems[sub] || '', max)),
                  chalk.green(exports.leftPad(subsystems[sub + 1] || '', max)),
                  chalk.green(exports.leftPad(subsystems[sub + 2] || '', max))
      )
    }
  }
}

// Given a commit hash, load it
// If a URL is passed in, then load the commit remotely
// If not, then do a git show
exports.load = function load(sha, cb) {
  const parsed = url.parse(sha)
  if (parsed.protocol) {
    return exports.loadPatch(parsed, cb)
  }

  exec(`git show --quiet --format=medium ${sha}`, (err, stdout, stderr) => {
    if (err) return cb(err)
    cb(null, stdout.trim())
  })
}

// Load the commit from a URL
exports.loadPatch = function loadPatch(uri, cb) {
  let h = http
  if (~uri.protocol.indexOf('https')) {
    h = https
  }
  uri.headers = {
    'user-agent': 'core-validate-commit'
  }
  h.get(uri, (res) => {
    let buf = ''
    res.on('data', (chunk) => {
      buf += chunk
    })

    res.on('end', () => {
      try {
        const out = JSON.parse(buf)
        cb(null, out)
      } catch (err) {
        cb(err)
      }
    })
  }).on('error', cb)
}

exports.validateMetadata = function(validator, args) {
  validator.on('commit', (c) => {
    pretty(c.commit, c.messages, validator)
    run()
  })

  function run() {
    if (!args.length) {
      process.exitCode = validator.errors
      return
    }
    const sha = args.shift()
    exports.load(sha, (err, data) => {
      if (err) throw err
      validator.lint(data)
    })
  }

  run()
}

exports.parseTap = function(validator, parsed, args) {
  const tap = new Tap()
  tap.pipe(process.stdout)
  if (parsed.out) tap.pipe(fs.createWriteStream(parsed.out))
  let count = 0
  let total = args.length

  validator.on('commit', (c) => {
    count++
    const test = tap.test(c.commit.sha)
    formatTap(test, c.commit, c.messages, validator)
    if (count === total) {
      setImmediate(() => {
        tap.end()
        if (tap.status === 'fail')
          process.exitCode = 1
      })
    }
  })

  function run() {
    if (!args.length) return
    const sha = args.shift()
    exports.load(sha, (err, data) => {
      if (err) throw err
      validator.lint(data)
      run()
    })
  }

  run()
}
