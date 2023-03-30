#!/usr/bin/env node

import { exec } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import nopt from 'nopt'
import pretty from '../lib/format-pretty.js'
import formatTap from '../lib/format-tap.js'
import Validator from '../lib/validator.js'
import Tap from '../lib/tap.js'
import * as utils from '../lib/utils.js'
import subsystem from '../lib/rules/subsystem.js'

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

if (parsed.help) {
  const usagePath = path.join(new URL(import.meta.url).pathname, '../usage.txt')
  const help = await fs.promises.readFile(usagePath, 'utf8')
  console.log(help)
  process.exit(0)
}

if (parsed.version) {
  const pkgJsonPath = path.join(new URL(import.meta.url).pathname, '../../package.json')
  const pkgJson = await fs.promises.readFile(pkgJsonPath, 'utf8')
  const { version } = JSON.parse(pkgJson)
  console.log(`core-validate-commit v${version}`)
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
