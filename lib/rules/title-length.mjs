const id = 'title-length'

export default {
  id,
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
    const isRevertCommit = /^Revert ".*"$/.test(context.title)
    const max = rule.options.max_length + (isRevertCommit ? 'Revert ""'.length : 0)
    if (context.title.length > max) {
      context.report({
        id,
        message: `Title must be <= ${max} columns.`,
        string: context.title,
        maxLength: max,
        line: 0,
        column: max,
        level: 'fail'
      })
      return
    }

    const len = rule.options.length + (isRevertCommit ? 'Revert ""'.length : 0)
    if (context.title.length > len) {
      context.report({
        id,
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
      id,
      message: `Title is <= ${len} columns.`,
      string: '',
      level: 'pass'
    })
  }
}
