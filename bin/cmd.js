#!/usr/bin/env node

'use strict'

const fs = require('fs')
const nopt = require('nopt')
const path = require('path')
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

// Create a new Validator
const v = new Validator(parsed)

// The --list or -l flag was used
if (parsed.list) {
  // Get the list of Rule names
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
    utils.load(sha, (err, data) => {
      if (err) throw err
      v.lint(data)
      run()
    })
  }

  run()

} else {
  // no --flags used,  defaults to --validate-metadata
  utils.validateMetadata(v, args)
  return
}
