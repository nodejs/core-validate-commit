'use strict'

const id = 'title-length'

module.exports = {
  id: id
, meta: {
    description: 'enforce max length of commit title'
  , recommended: true
  }
, defaults: {
    length: 50
  }
, options: {
    length: 50
  }
, validate: (context, rule) => {
    const len = rule.options.length
    if (context.title.length > len) {
      context.report({
        id: id
      , message: `Title must be <= ${len} columns.`
      , string: context.title
      , maxLength: len
      , line: 0
      , column: len
      , level: 'fail'
      })
      return
    }

    context.report({
      id: id
    , message: `Title is <= ${len} columns.`
    , string: ''
    , level: 'pass'
    })
  }
}
