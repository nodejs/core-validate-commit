const id = 'assisted-by-is-trailer'

export default {
  id,
  meta: {
    description: 'enforce that "Assisted-by:" lines are trailers',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    const parsed = context.toJSON()
    const lines = parsed.body.map((line, i) => [line, i])
    const re = /^Assisted-by:/gi
    const assisted = lines.filter(([line]) => re.test(line))
    if (assisted.length !== 0) {
      const firstAssisted = assisted[0]
      const emptyLines = lines.filter(([text]) => text.trim().length === 0)
      // There must be at least one empty line, and the last empty line must be
      // above the first Assisted-by line.
      const isTrailer = (emptyLines.length !== 0) &&
                        emptyLines.at(-1)[1] < firstAssisted[1]
      if (isTrailer) {
        context.report({
          id,
          message: 'Assisted-by is a trailer',
          string: '',
          level: 'pass'
        })
      } else {
        context.report({
          id,
          message: 'Assisted-by must be a trailer',
          string: firstAssisted[0],
          line: firstAssisted[1],
          column: 0,
          level: 'fail'
        })
      }
    } else {
      context.report({
        id,
        message: 'no Assisted-by metadata',
        string: '',
        level: 'pass'
      })
    }
  }
}
