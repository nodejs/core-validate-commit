'use strict'

const id = 'line-length'

module.exports = {
  id: id
, meta: {
    description: 'enforce max length of lines in commit body'
  , recommended: true
  }
, defaults: {
    length: 72
  }
, options: {
    length: 72
  }
, validate: (context, rule) => {
    const len = rule.options.length
    const parsed = context.toJSON()
    // release commits include the notable changes from the changelog
    // in the commit message
    if (parsed.release) return
    for (let i = 0; i < parsed.body.length; i++) {
      const line = parsed.body[i]
      if (line.length > len) {
        context.report({
          id: id
        , message: `Line should be <= ${len} columns.`
        , string: line
        , maxLength: len
        , line: i
        , column: len
        , level: 'error'
        })
      }
    }
  }
}
