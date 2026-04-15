const id = 'line-length'

export default {
  id,
  meta: {
    description: 'enforce max length of lines in commit body',
    recommended: true
  },
  defaults: {
    length: 72,
    trailerLength: 120
  },
  options: {
    length: 72,
    trailerLength: 120
  },
  validate: (context, rule) => {
    const len = rule.options.length
    const parsed = context.toJSON()
    // release commits include the notable changes from the changelog
    // in the commit message
    if (parsed.release) {
      context.report({
        id,
        message: 'skipping line-length for release commit',
        string: '',
        level: 'skip'
      })
      return
    }
    let failed = false
    const body = parsed.trailerFreeBody ?? parsed.body
    for (let i = 0; i < body.length; i++) {
      const line = body[i]

      // Skip quoted lines, e.g. for original commit messages of V8 backports.
      if (line.startsWith('    ')) { continue }
      // Skip lines with URLs.
      if (/https?:\/\//.test(line)) { continue }

      if (line.length > len) {
        failed = true
        context.report({
          id,
          message: `Line should be <= ${len} columns.`,
          string: line,
          maxLength: len,
          line: i,
          column: len,
          level: 'fail'
        })
      }
    }
    for (let i = 0; i < (parsed.trailers?.length ?? 0); i++) {
      const line = parsed.trailers[i]
      const len = rule.options.trailerLength
      if (line.length > len) {
        failed = true
        context.report({
          id,
          message: `Trailer should be <= ${len} columns.`,
          string: line,
          maxLength: len,
          line: i + parsed.body.length - parsed.trailers.length,
          column: len,
          level: 'fail'
        })
      }
    }

    if (!failed) {
      context.report({
        id,
        message: 'line-lengths are valid',
        string: '',
        level: 'pass'
      })
    }
  }
}
