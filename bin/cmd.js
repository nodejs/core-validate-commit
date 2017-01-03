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
const knownOpts = { help: Boolean
                  , version: Boolean
                  , 'validate-metadata': Boolean
                  , tap: Boolean
                  , out: path
                  , list: Boolean
                  }
const shortHand = { h: ['--help']
                  , v: ['--version']
                  , V: ['--validate-metadata']
                  , t: ['--tap']
                  , o: ['--out']
                  , l: ['--list']
                  }

const parsed = nopt(knownOpts, shortHand)
const usage = require('help')()

if (parsed.help) {
  return usage()
}

if (parsed.version) {
  console.log('core-validate-commit', 'v' + require('../package').version)
  return
}

const args = parsed.argv.remain
if (!args.length)
  args.push('HEAD')

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

function loadPatch(uri, cb) {
  var h = http
  if (~uri.protocol.indexOf('https')) {
    h = https
  }
  uri.headers = {
    'user-agent': 'core-validate-commit'
  }
  h.get(uri, (res) => {
    var buf = ''
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

if (parsed.list) {
  const ruleNames = Array.from(v.rules.keys())
  const max = ruleNames.reduce((m, item) => {
    if (item.length > m) m = item.length
    return m
  }, 0)

  for (const rule of v.rules.values()) {
    utils.describeRule(rule, max)
  }
  return
}

if (parsed.tap) {
  const tap = new Tap()
  tap.pipe(process.stdout)
  if (parsed.out) tap.pipe(fs.createWriteStream(parsed.out))
  var count = 0
  var total = args.length

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
