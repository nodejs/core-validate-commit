const id = 'metadata-end'

export default {
  id,
  meta: {
    description: 'enforce that metadata is at the end of commit messages',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    const parsed = context.toJSON()
    const body = parsed.body
    const end = parsed.metadata.end
    if (end < body.length) {
      const extra = body.slice(end + 1)
      let lineNum = end + 1
      for (let i = 0; i < extra.length; i++) {
        if (extra[i]) {
          lineNum += i
          break
        }
      }

      if (lineNum !== end + 1) {
        context.report({
          id,
          message: 'commit metadata at end of message',
          string: body[lineNum],
          line: lineNum,
          column: 0,
          level: 'fail'
        })
        return
      }
    }

    context.report({
      id,
      message: 'metadata is at end of message',
      string: '',
      level: 'pass'
    })
  }
}
