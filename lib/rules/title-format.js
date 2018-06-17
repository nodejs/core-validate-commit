'use strict'

const id = 'title-format'

module.exports = {
  id: id
, meta: {
    description: 'enforce commit title format'
  , recommended: true
  }
, validate: (context, rule) => {
    if (/[\.\?\!]$/.test(context.title)) {
      context.report({
        id: id
      , message: 'Do not use punctuation at end of title.'
      , string: context.title
      , line: 0
      , column: context.title.length
      , level: 'fail'
      })
      return
    }

    context.report({
      id: id
    , message: 'Title is formatted correctly.'
    , string: ''
    , level: 'pass'
    })
  }
}
