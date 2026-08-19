import { describe, test } from 'node:test'
import BaseRule from '../lib/rule.js'

describe('Base Rule Test', () => {
  test('No id param', (t) => {
    t.assert.throws(() => {
      const Rule = new BaseRule()
      Rule()
    }, { message: 'Rule must have an id' })
  })

  test('No validate function', (t) => {
    t.assert.throws(() => {
      const Rule = new BaseRule({ id: 'test-rule' })
      Rule()
    }, { message: 'Rule must have validate function' })
  })
})
