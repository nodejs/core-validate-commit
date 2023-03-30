import { test } from 'tap'
import * as utils from '../lib/utils.js'

// We aren't testing the chalk library, so strip off the colors/styles it adds
const stripAnsiRegex =
/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g // eslint-disable-line no-control-regex

const originalConsoleLog = console.log

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

  t.test('test describeRule function', (tt) => {
    function logger () {
      const args = [...arguments]
      tt.equal(args[1].replace(stripAnsiRegex, ''),
        '              rule-id', 'has a title with padding')
      tt.equal(args[2].replace(stripAnsiRegex, ''),
        'a description', 'has a description')
    }

    // overrite the console.log
    console.log = logger
    utils.describeRule({ id: 'rule-id', meta: { description: 'a description' } })
    // put it back
    console.log = originalConsoleLog
    tt.end()
  })

  t.test('test describeRule function - no meta data description', (tt) => {
    function logger () {
      tt.fails('should not reach here')
    }

    // overrite the console.log
    console.log = logger
    utils.describeRule({ id: 'rule-id', meta: {} })
    tt.pass('no return value')

    // put it back
    console.log = originalConsoleLog
    tt.end()
  })

  t.test('test describeSubsystem function - no subsystems', (tt) => {
    function logger () {
      tt.fails('should not reach here')
    }

    // overrite the console.log
    console.log = logger
    utils.describeSubsystem()
    tt.pass('no return value')
    // put it back
    console.log = originalConsoleLog
    tt.end()
  })

  t.end()
})
