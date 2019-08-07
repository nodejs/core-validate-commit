'use strict'

const { test } = require('tap')
const utils = require('../lib/utils')

// We aren't testing the chalk library, so strip off the colors/styles it adds
const stripAnsiRegex =
/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

test('test utility functions', (t) => {
  t.test('test rightPad function - with padding', (tt) => {
    const padded = utils.rightPad('string', 10)
    tt.equal(padded.length, 11, 'should have extra padding')
    tt.equal(padded, 'string     ', 'should have padding on the right')

    tt.end()
  })

  t.test('test rightPad function - withou padding', (tt) => {
    const padded = utils.rightPad('string', 5)
    tt.equal(padded.length, 6, 'should have the same length')
    tt.equal(padded, 'string', 'should have no padding on the right')

    tt.end()
  })

  t.test('test leftPad function - with padding', (tt) => {
    const padded = utils.leftPad('string', 10)
    tt.equal(padded.length, 11, 'should have extra padding')
    tt.equal(padded, '     string', 'should have padding on the left')

    tt.end()
  })

  t.test('test leftPad function - withou padding', (tt) => {
    const padded = utils.leftPad('string', 5)
    tt.equal(padded.length, 6, 'should have the same length')
    tt.equal(padded, 'string', 'should have no padding on the left')

    tt.end()
  })

  t.test('test headers function - skip', (tt) => {
    const header = utils.header('abc123', 'skip')
    tt.equal(header.replace(stripAnsiRegex, ''),
             '✔  abc123 # SKIPPED',
             'should be equal')
    tt.end()
  })

  t.test('test headers function - pass', (tt) => {
    const header = utils.header('abc123', 'pass')
    tt.equal(header.replace(stripAnsiRegex, ''),
             '✔  abc123',
             'should be equal')
    tt.end()
  })

  t.test('test headers function - pass', (tt) => {
    const header = utils.header('abc123', 'pass')
    tt.equal(header.replace(stripAnsiRegex, ''),
             '✔  abc123',
             'should be equal')
    tt.end()
  })

  t.test('test headers function - fail', (tt) => {
    const header = utils.header('abc123', 'fail')
    tt.equal(header.replace(stripAnsiRegex, ''),
             '✖  abc123',
             'should be equal')
    tt.end()
  })

  t.end()
})
