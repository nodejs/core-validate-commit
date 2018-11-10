'use strict'

const id = 'skip-autosquashable'

module.exports = {
  id: id
, meta: {
    description: 'skip autosquashable fixup! and squash! commits'
  , recommended: true
  }
, disabled: true
, defaults: { }
, options: { }
, validate: (context, rule) => {
    if (context.title.startsWith('fixup!')) {
      context.report({
        id: id
      , message: 'Skipping fixup! commit.'
      , string: context.title
      , level: 'pass'
      })
      return
    }

    if (context.title.startsWith('squash!')) {
      context.report({
        id: id
      , message: 'Skipping squash! commit.'
      , string: context.title
      , level: 'pass'
      })
      return
    }

    context.report({
      id: id
    , message: 'Commit is neither fixup! nor squash!.'
    , string: context.title
    , line: 0
    , column: 0
    , level: 'fail'
    })
  }
}
