#!/usr/bin/env node

'use strict'

const exec = require('child_process').exec
const fs = require('fs')
const http = require('http')
const https = require('https')
const nopt = require('nopt')
const path = require('path')
const pretty = require('../lib/format-pretty')
const formatTap = require('../lib/format-tap')
const Validator = require('../lib')
const Tap = require('../lib/tap')
const utils = require('../lib/utils')
const subsystem = require('../lib/rules/subsystem')
const knownOpts = {
  help: Boolean,
  version: Boolean,
  'validate-metadata': Boolean,
  tap: Boolean,
  out: path,
  list: Boolean,
  'list-subsystems': Boolean
}
const shortHand = {
  h: ['--help'],
  v: ['--version'],
  V: ['--validate-metadata'],
  t: ['--tap'],
  o: ['--out'],
  l: ['--list'],
  ls: ['--list-subsystems']
}

const parsed = nopt(knownOpts, shortHand)
const usage = require('help')()

if (parsed.help) {
  usage()
}

if (parsed.version) {
  console.log('core-validate-commit', 'v' + require('../package').version)
  process.exit(0)
}

const args = parsed.argv.remain
if (!parsed.help && !args.length) { args.push('HEAD') }

function load (sha, cb) {
  try {
    const parsed = new URL(sha)
    return loadPatch(parsed, cb)
  } catch (_) {
    exec(`git show --quiet --format=medium ${sha}`, (err, stdout, stderr) => {
      if (err) return cb(err)
      cb(null, stdout.trim())
    })
  }
}

function loadPatch (uri, cb) {
  let h = http
  if (~uri.protocol.indexOf('https')) {
    h = https
  }
  const headers = {
    'user-agent': 'core-validate-commit'
  }
  h.get(uri, { headers }, (res) => {
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

const v = new Validator(parsed)

if (parsed['list-subsystems']) {
  utils.describeSubsystem(subsystem.defaults.subsystems.sort())
  process.exit(0)
}

if (parsed.list) {
  const ruleNames = Array.from(v.rules.keys())
  const max = ruleNames.reduce((m, item) => {
    if (item.length > m) m = item.length
    return m
  }, 0)

  for (const rule of v.rules.values()) {
    utils.describeRule(rule, max)
  }
  process.exit(0)
}

if (parsed.tap) {
  const tap = new Tap()
  tap.pipe(process.stdout)
  if (parsed.out) tap.pipe(fs.createWriteStream(parsed.out))
  let count = 0
  const total = args.length

  v.on('commit', (c) => {
    count++
    const test = tap.test(c.commit.sha)
    formatTap(test, c.commit, c.messages, v)
    if (count === total) {
      setImmediate(() => {
        tap.end()
        if (tap.status === 'fail') { process.exitCode = 1 }
      })
    }
  })

  tapRun()
} else {
  v.on('commit', (c) => {
    pretty(c.commit, c.messages, v)
    commitRun()
  })

  commitRun()
}

function tapRun () {
  if (!args.length) return
  const sha = args.shift()
  load(sha, (err, data) => {
    if (err) throw err
    v.lint(data)
    tapRun()
  })
}

function commitRun () {
  if (!args.length) {
    process.exitCode = v.errors
    return
  }
  const sha = args.shift()
  load(sha, (err, data) => {
    if (err) throw err
    v.lint(data)
  })
}
