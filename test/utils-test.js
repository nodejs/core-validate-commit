'use strict'

const { test } = require('tap')
const utils = require('../lib/utils')

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

  t.end()
})
