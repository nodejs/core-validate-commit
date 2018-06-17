'use strict'

const id = 'title-format'

module.exports = {
  id: id
, meta: {
    description: 'enforce commit title format'
  , recommended: true
  }
, validate: (context, rule) => {
    let pass = true
    if (/[\.\?\!]$/.test(context.title)) {
      context.report({
        id: id
      , message: 'Do not use punctuation at end of title.'
      , string: context.title
      , line: 0
      , column: context.title.length
      , level: 'fail'
      })
      pass = false
    }

    const result = /^(.+?): [A-Z]/.exec(context.title)
    if (result) {
      context.report({
        id: id
      , message: 'First word after subsystem(s) in title should be lowercase.'
      , string: context.title
      , line: 0
      , column: result[1].length + 3
      , level: 'fail'
      })
      pass = false
    }

    if (pass) {
      context.report({
        id: id
      , message: 'Title is formatted correctly.'
      , string: ''
      , level: 'pass'
      })
    }
  }
}
