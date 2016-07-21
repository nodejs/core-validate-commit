'use strict'

const id = 'reviewers'

module.exports = {
  id: id
, meta: {
    description: 'enforce having reviewers'
  , recommended: true
  }
, defaults: {}
, options: {}
, validate: (context, rule) => {
    const parsed = context.toJSON()
    // release commits generally won't have any reviewers
    if (parsed.release) return

    if (!Array.isArray(parsed.reviewers) || !parsed.reviewers.length) {
      // See nodejs/node#5aac4c42da104c30d8f701f1042d61c2f06b7e6c
      // for an example
      return context.report({
        id: id
      , message: 'Commit must have at least 1 reviewer.'
      , string: null
      , line: 0
      , column: 0
      , level: 'error'
      })
    }

    // TODO(evanlucas) verify that each reviewer is a collaborator
    // This will probably be easier to do once we move gitlint-parser-node
    // over to using an array of objects with parsed reviewers vs an array
    // of strings
  }
}
