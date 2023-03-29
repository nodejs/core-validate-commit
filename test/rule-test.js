import { test } from 'tap'
import BaseRule from '../lib/rule.js'

test('Base Rule Test', (t) => {
  t.test('No id param', (tt) => {
    tt.throws(() => {
      const Rule = new BaseRule()
      Rule()
    }, 'Rule must have an id')

    tt.end()
  })

  t.test('No validate function', (tt) => {
    tt.throws(() => {
      const Rule = new BaseRule({ id: 'test-rule' })
      Rule()
    }, 'Rule must have validate function')

    tt.end()
  })

  t.end()
})
