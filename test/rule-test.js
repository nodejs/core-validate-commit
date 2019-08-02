'use strict'

const test = require('tap').test
const BaseRule = require('../lib/rule')

test('Base Rule Test', (t) => {
  t.test('No id param', (tt) => {
    try {
      new BaseRule()
      tt.fail('This should fail')
    } catch (err) {
      tt.equal(err.message,
               'Rule must have an id',
               'Should have error message about id')
      tt.end()
    }
  })

  t.test('No validate function', (tt) => {
    try {
      new BaseRule({id: 'test-rule'})
      tt.fail('This should fail')
    } catch (err) {
      tt.equal(err.message,
               'Rule must have validate function',
               'Should have error message about validate function')
      tt.end()
    }
  })

  t.end()
})
