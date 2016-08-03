'use strict'

const id = 'fixes-url'

module.exports = {
  id: id
, meta: {
    description: 'enforce format of Fixes URLs'
  , recommended: true
  }
, defaults: {}
, options: {}
, validate: (context, rule) => {
    const parsed = context.toJSON()
    if (!Array.isArray(parsed.fixes) || !parsed.fixes.length) {
      context.report({
        id: id
      , message: 'skipping fixes-url'
      , string: ''
      , level: 'skip'
      })
      return
    }
    for (const url of parsed.fixes) {
      if (url[0] === '#') {
        // See nodejs/node#2aa376914b621018c5784104b82c13e78ee51307
        // for an example
        const { line, column } = findLineAndColumn(context.body, url)
        context.report({
          id: id
        , message: 'Fixes must be a url, not an issue number.'
        , string: url
        , line: line
        , column: column
        , level: 'fail'
        })
      } else {
        const { line, column } = findLineAndColumn(context.body, url)
        context.report({
          id: id
        , message: 'Valid fixes url'
        , string: url
        , line: line
        , column: column
        , level: 'pass'
        })
      }
    }
  }
}

function findLineAndColumn(body, str) {
  for (var i = 0; i < body.length; i++) {
    const l = body[i]
    if (~l.indexOf('Fixes')) {
      const idx = l.indexOf(str)
      if (idx !== -1) {
        return {
          line: i
        , column: idx
        }
      }
    }
  }

  return {
    line: -1
  , column: -1
  }
}
