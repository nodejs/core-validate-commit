const id = 'co-authored-by-is-trailer'

export default {
  id,
  meta: {
    description: 'enforce that "Co-authored-by:" lines are trailers',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    const parsed = context.toJSON()
    const lines = parsed.body.map((line, i) => [line, i])
    const re = /^\s*Co-authored-by:/gi
    const coauthors = lines.filter(([line]) => re.test(line))
    if (coauthors.length !== 0) {
      const firstCoauthor = coauthors[0]
      const emptyLines = lines.filter(([text]) => text.trim().length === 0)
      // There must be at least one empty line, and the last empty line must be
      // above the first Co-authored-by line.
      const isTrailer = (emptyLines.length !== 0) &&
                        emptyLines.pop()[1] < firstCoauthor[1]
      if (isTrailer) {
        context.report({
          id,
          message: 'Co-authored-by is a trailer',
          string: '',
          level: 'pass'
        })
      } else {
        context.report({
          id,
          message: 'Co-authored-by must be a trailer',
          string: firstCoauthor[0],
          line: firstCoauthor[1],
          column: 0,
          level: 'fail'
        })
      }
    } else {
      context.report({
        id,
        message: 'no Co-authored-by metadata',
        string: '',
        level: 'pass'
      })
    }
  }
}
