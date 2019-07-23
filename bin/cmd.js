#!/usr/bin/env node

'use strict'

const exec = require('child_process').exec
const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')
const nopt = require('nopt')
const path = require('path')
const pretty = require('../lib/format-pretty')
const formatTap = require('../lib/format-tap')
const Validator = require('../lib')
const Tap = require('../lib/tap')
const utils = require('../lib/utils')
const subsystem = require('../lib/rules/subsystem')
const knownOpts = { help: Boolean
, version: Boolean
, 'validate-metadata': Boolean
, tap: Boolean
, out: path
, list: Boolean
, 'list-subsystems': Boolean
}
const shortHand = { h: ['--help']
, v: ['--version']
, V: ['--validate-metadata']
, t: ['--tap']
, o: ['--out']
, l: ['--list']
, ls: ['--list-subsystems']
}

const parsed = nopt(knownOpts, shortHand)
const usage = require('help')()

// The --help or -h flag was used
if (parsed.help) {
  return usage()
}

// The --version or -v flag was used
if (parsed.version) {
  console.log('core-validate-commit', 'v' + require('../package').version)
  return
}

// The --list-subsytems or --ls flag was used
if (parsed['list-subsystems']) {
  utils.describeSubsystem(subsystem.defaults.subsystems.sort())
  return
}

// any arguments after a --flag will be in the remain array
const args = parsed.argv.remain

// The argument should be the commit you are validating
// If there is no args,  then use the HEAD commit
if (!args.length)
  args.push('HEAD')

// Given a commit hash, load it
// If a URL is passed in, then load the commit remotely
// If not, then do a git show
function load(sha, cb) {
  const parsed = url.parse(sha)
  if (parsed.protocol) {
    return loadPatch(parsed, cb)
  }

  exec(`git show --quiet --format=medium ${sha}`, (err, stdout, stderr) => {
    if (err) return cb(err)
    cb(null, stdout.trim())
  })
}

// Load the commit from a URL
function loadPatch(uri, cb) {
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

// Create a new Validator
const v = new Validator(parsed)

// The --list or -l flag was used
if (parsed.list) {
  // Get the list of Rule names
  // There is nothing here that says we need to have created that validator first,
  // unless at some point we don't count disabled things
  // But we should probably just get the rules from the rules in ./lib/rules
  // Then this function can move up to the top
  const ruleNames = Array.from(v.rules.keys())
  // Find the length of the longest Rule names
  const max = ruleNames.reduce((m, item) => {
    if (item.length > m) m = item.length
    return m
  }, 0)
  // Loop through and output the rules
  for (const rule of v.rules.values()) {
    utils.describeRule(rule, max)
  }
  return
}

// The --tap or -t flag was used
if (parsed.tap) {
  const tap = new Tap()
  tap.pipe(process.stdout)
  if (parsed.out) tap.pipe(fs.createWriteStream(parsed.out))
  let count = 0
  let total = args.length

  v.on('commit', (c) => {
    count++
    const test = tap.test(c.commit.sha)
    formatTap(test, c.commit, c.messages, v)
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
    load(sha, (err, data) => {
      if (err) throw err
      v.lint(data)
      run()
    })
  }

  run()

} else {
  // no --flags used,  defaults to --validate-metadata
  v.on('commit', (c) => {
    pretty(c.commit, c.messages, v)
    run()
  })

  function run() {
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

  run()
}
