import { describe, test } from 'node:test'
import * as utils from '../lib/utils.js'

// We aren't testing the chalk library, so strip off the colors/styles it adds
const stripAnsiRegex =
/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g // eslint-disable-line no-control-regex

const originalConsoleLog = console.log

describe('test utility functions', () => {
  test('test rightPad function - with padding', (t) => {
    const padded = utils.rightPad('string', 10)
    t.assert.strictEqual(padded.length, 11, 'should have extra padding')
    t.assert.strictEqual(padded, 'string     ', 'should have padding on the right')
  })

  test('test rightPad function - withou padding', (t) => {
    const padded = utils.rightPad('string', 5)
    t.assert.strictEqual(padded.length, 6, 'should have the same length')
    t.assert.strictEqual(padded, 'string', 'should have no padding on the right')
  })

  test('test leftPad function - with padding', (t) => {
    const padded = utils.leftPad('string', 10)
    t.assert.strictEqual(padded.length, 11, 'should have extra padding')
    t.assert.strictEqual(padded, '     string', 'should have padding on the left')
  })

  test('test leftPad function - withou padding', (t) => {
    const padded = utils.leftPad('string', 5)
    t.assert.strictEqual(padded.length, 6, 'should have the same length')
    t.assert.strictEqual(padded, 'string', 'should have no padding on the left')
  })

  test('test headers function - skip', (t) => {
    const header = utils.header('abc123', 'skip')
    t.assert.strictEqual(header.replace(stripAnsiRegex, ''),
      '✔  abc123 # SKIPPED',
      'should be equal')
  })

  test('test headers function - pass', (t) => {
    const header = utils.header('abc123', 'pass')
    t.assert.strictEqual(header.replace(stripAnsiRegex, ''),
      '✔  abc123',
      'should be equal')
  })

  test('test headers function - pass', (t) => {
    const header = utils.header('abc123', 'pass')
    t.assert.strictEqual(header.replace(stripAnsiRegex, ''),
      '✔  abc123',
      'should be equal')
  })

  test('test headers function - fail', (t) => {
    const header = utils.header('abc123', 'fail')
    t.assert.strictEqual(header.replace(stripAnsiRegex, ''),
      '✖  abc123',
      'should be equal')
  })

  test('test describeRule function', (t) => {
    function logger () {
      const args = [...arguments]
      t.assert.strictEqual(args[1].replace(stripAnsiRegex, ''),
        '              rule-id', 'has a title with padding')
      t.assert.strictEqual(args[2].replace(stripAnsiRegex, ''),
        'a description', 'has a description')
    }

    // overrite the console.log
    console.log = logger
    utils.describeRule({ id: 'rule-id', meta: { description: 'a description' } })
    // put it back
    console.log = originalConsoleLog
  })

  test('test describeRule function - no meta data description', (t) => {
    function logger () {
      t.assert.fail('should not reach here')
    }

    // overrite the console.log
    console.log = logger
    utils.describeRule({ id: 'rule-id', meta: {} })
    t.assert.ok(true, 'no return value')

    // put it back
    console.log = originalConsoleLog
  })

  test('test describeSubsystem function - no subsystems', (t) => {
    function logger () {
      t.assert.fail('should not reach here')
    }

    // overrite the console.log
    console.log = logger
    utils.describeSubsystem()
    t.assert.ok(true, 'no return value')
    // put it back
    console.log = originalConsoleLog
  })
})
