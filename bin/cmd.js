#!/usr/bin/env node

import { exec } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { parseArgs } from 'node:util'
import pretty from '../lib/format-pretty.js'
import formatTap from '../lib/format-tap.js'
import Validator from '../lib/validator.js'
import Tap from '../lib/tap.js'
import * as utils from '../lib/utils.js'
import subsystem from '../lib/rules/subsystem.js'

const { values: parsed, positionals: args } = parseArgs({
  options: {
    help: {
      type: 'boolean',
      short: 'h'
    },
    version: {
      type: 'boolean',
      short: 'v'
    },
    'validate-metadata': {
      type: 'boolean',
      short: 'V'
    },
    tap: {
      type: 'boolean',
      short: 't'
    },
    out: {
      type: 'string',
      short: 'o'
    },
    list: {
      type: 'boolean',
      short: 'l'
    },
    'list-subsystems': {
      type: 'boolean'
    }
  },
  allowNegative: true,
  allowPositionals: true
})

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

if (!parsed.help && !args.length) { args.push('HEAD') }

function load (sha, cb) {
  // Handle pre-parsed commit objects from stdin
  if (typeof sha === 'object') {
    return process.nextTick(() => {
      cb(null, sha)
    })
  }

  const parsed = URL.parse(sha)
  if (parsed != null) {
    return loadPatch(parsed, cb)
  }
  exec(`git show --quiet --format=medium ${sha}`, (err, stdout, stderr) => {
    if (err) return cb(err)
    cb(null, stdout.trim())
  })
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

// Don't start processing if reading from stdin (handled in stdin.on('end'))
if (args.length === 1 && args[0] === '-') {
  const chunks = []
  process.stdin.on('data', (chunk) => chunks.push(chunk))
  process.stdin.on('end', () => {
    try {
      const input = Buffer.concat(chunks).toString('utf8')
      const commits = JSON.parse(input)

      if (!Array.isArray(commits)) {
        throw new Error('Input must be an array')
      }

      // Replace args with the commit data directly
      for (let i = 0; i < commits.length; i++) {
        if (!commit.id || !commit.message) {
          throw new Error('Each commit must have "id" and "message" properties')
        }
        args[i] = { sha: commit.id, ...commit }
      }
      run()
    } catch (err) {
      console.error('Error parsing JSON input:', err.message)
      process.exit(1)
    }
  })
  process.stdin.resume()
} else {
  run()
}

function run () {
  if (!parsed.tap) {
    v.on('commit', (c) => {
      pretty(c.commit, c.messages, v)
      commitRun()
    })

    commitRun()
    return
  }
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
