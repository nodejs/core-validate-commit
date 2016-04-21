#!/usr/bin/env node

'use strict'

const exec = require('child_process').exec
const chalk = require('chalk')
const args = process.argv.splice(2)
const help = require('help')()
const Commit = require('../commit')

if (!args.length) return help()
for (const arg of args) {
  if (arg === 'help' || arg === '--help' || arg === '-h') {
    return help()
  }

  if (arg === 'version' || arg === '--version' || arg === '-v') {
    console.log('core-validate-commit', 'v' + require('../package').version)
    return
  }
}

function getCommitCommand(sha) {
  return `git show --quiet ${sha}`
}

;(function run() {
  if (!args.length) return
  const sha = args.shift()
  exec(getCommitCommand(sha), (err, stdout, stderr) => {
    if (err) throw err
    const c = new Commit(stdout)

    console.log(chalk.cyan('Commit'), sha)
    c.errors.forEach((m) => {
      console.error('  ', chalk.red(m.code), chalk.grey(m.str))
      process.exitCode = 1
    })

    c.warnings.forEach((m) => {
      console.error('  ', chalk.yellow(m.code), chalk.grey(m.str))
    })

    if (!c.errors.length && !c.warnings.length) {
      console.log('  ', chalk.green('OK'))
    }
    run()
  })
})()
