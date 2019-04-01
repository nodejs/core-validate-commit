'use strict'

const id = 'pr-url'
const prUrl = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+$/

module.exports = {
  id: id
, meta: {
    description: 'enforce PR-URL'
  , recommended: true
  }
, defaults: {}
, options: {}
, validate: (context, rule) => {
    if (!context.prUrl) {
      context.report({
        id: id
      , message: 'Commit must have a PR-URL.'
      , string: context.prUrl
      , line: 0
      , column: 0
      , level: 'fail'
      })
      return
    }
    var line = -1
    var column = -1
    for (var i = 0; i < context.body.length; i++) {
      const l = context.body[i]
      if (~l.indexOf('PR-URL') && ~l.indexOf(context.prUrl)) {
        line = i
        column = l.indexOf(context.prUrl)
      }
    }
    if (context.prUrl[0] === '#') {
      // see nodejs/node#7d3a7ea0d7df9b6f11df723dec370f49f4f87e99
      // for an example
      context.report({
        id: id
      , message: 'PR-URL must be a URL, not a pull request number.'
      , string: context.prUrl
      , line: line
      , column: column
      , level: 'fail'
      })
    } else if (!prUrl.test(context.prUrl)) {
      context.report({
        id: id
      , message: 'PR-URL must be a GitHub pull request URL.'
      , string: context.prUrl
      , line: line
      , column: column
      , level: 'fail'
      })
    } else {
      context.report({
        id: id
      , message: 'PR-URL is valid.'
      , string: context.prUrl
      , line: line
      , column: column
      , level: 'pass'
      })
    }
  }
}
