#!/usr/bin/env node

'use strict'

const exec = require('child_process').exec
const http = require('http')
const https = require('https')
const url = require('url')
const nopt = require('nopt')

const pretty = require('../lib/format-pretty')
const tap = require('../lib/format-tap')
const Validator = require('../lib')

const knownOpts = { help: Boolean
                  , version: Boolean
                  , 'validate-metadata': Boolean
                  , tap: Boolean
                  }
const shortHand = { h: ['--help']
                  , v: ['--version']
                  , V: ['--validate-metadata']
                  , t: ['--tap']
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

function load(sha, cb) {
  const parsed = url.parse(sha)
  if (parsed.protocol) {
    return loadPatch(parsed, cb)
  }

  exec(`git show --quiet ${sha}`, (err, stdout, stderr) => {
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

if (parsed.tap) {
  var errCount = 0
  v.on('commit', (c) => {
    errCount += c.commit.errors
    tap(c.commit, c.messages, v)
  })

  function run() {
    if (!args.length) {
      return
    }
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
