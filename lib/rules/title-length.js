'use strict'

const id = 'title-length'

module.exports = {
  id: id,
  meta: {
    description: 'enforce max length of commit title',
    recommended: true
  },
  defaults: {
    length: 50,
    max_length: 72
  },
  options: {
    length: 50,
    max_length: 72
  },
  validate: (context, rule) => {
    const max = rule.options.max_length
    if (context.title.length > max) {
      context.report({
        id: id,
        message: `Title must be <= ${max} columns.`,
        string: context.title,
        maxLength: max,
        line: 0,
        column: max,
        level: 'fail'
      })
      return
    }

    const len = rule.options.length
    if (context.title.length > len) {
      context.report({
        id: id,
        message: `Title should be <= ${len} columns.`,
        string: context.title,
        maxLength: len,
        line: 0,
        column: len,
        level: 'warn'
      })
      return
    }

    context.report({
      id: id,
      message: `Title is <= ${len} columns.`,
      string: '',
      level: 'pass'
    })
  }
}
