const id = 'line-after-title'

export default {
  id,
  meta: {
    description: 'enforce a blank newline after the commit title',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    // all commits should have a body and a blank line after the title
    if (context.body[0]) {
      context.report({
        id,
        message: 'blank line expected after title',
        string: context.body.length ? context.body[0] : '',
        line: 1,
        column: 0,
        level: 'fail'
      })
      return
    }

    context.report({
      id,
      message: 'blank line after title',
      string: '',
      level: 'pass'
    })
  }
}
