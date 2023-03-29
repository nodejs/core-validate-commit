const id = 'title-format'

export default {
  id,
  meta: {
    description: 'enforce commit title format',
    recommended: true
  },
  validate: (context, rule) => {
    const isRevertCommit = /^Revert ".*"$/.test(context.title)
    const revertPrefixLength = 'Revert "'.length
    const titleWithoutRevertPrefix = isRevertCommit
      ? context.title.substr(revertPrefixLength,
        context.title.length - revertPrefixLength - 1)
      : context.title
    let pass = true
    if (/[.?!]$/.test(titleWithoutRevertPrefix)) {
      context.report({
        id,
        message: 'Do not use punctuation at end of title.',
        string: context.title,
        line: 0,
        column: context.title.length,
        level: 'fail'
      })
      pass = false
    }

    {
      const result = /^([^:]+:)[^ ]/.exec(titleWithoutRevertPrefix)
      if (result) {
        context.report({
          id,
          message: 'Add a space after subsystem(s).',
          string: context.title,
          line: 0,
          column: result[1].length,
          level: 'fail'
        })
        pass = false
      }
    }

    {
      const result = /\s\s/.exec(titleWithoutRevertPrefix)
      if (result) {
        context.report({
          id,
          message: 'Do not use consecutive spaces in title.',
          string: context.title,
          line: 0,
          column: result.index + 1,
          level: 'fail'
        })
        pass = false
      }
    }

    const isV8 = titleWithoutRevertPrefix.startsWith('deps: V8:')
    if (!isV8) {
      const result = /^([^:]+?): [A-Z]/.exec(titleWithoutRevertPrefix)
      if (result) {
        context.report({
          id,
          message: 'First word after subsystem(s) in title should be lowercase.',
          string: context.title,
          line: 0,
          column: result[1].length + 3,
          level: 'fail'
        })
        pass = false
      }
    }

    if (pass) {
      context.report({
        id,
        message: 'Title is formatted correctly.',
        string: '',
        level: 'pass'
      })
    }
  }
}
