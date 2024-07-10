const id = 'fixes-url'
const github = new RegExp('^https://github\\.com/[\\w-]+/[\\w-]+/' +
  '(issues|pull)/\\d+(#issuecomment-\\d+|#discussion_r\\d+)?/?$'
)

export default {
  id,
  meta: {
    description: 'enforce format of Fixes URLs',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    const parsed = context.toJSON()
    if (!Array.isArray(parsed.fixes) || !parsed.fixes.length) {
      context.report({
        id,
        message: 'skipping fixes-url',
        string: '',
        level: 'skip'
      })
      return
    }
    // Allow GitHub issues with optional comment.
    // GitHub pull requests must reference a comment or discussion.
    for (const url of parsed.fixes) {
      const match = github.exec(url)
      if (url[0] === '#') {
        // See nodejs/node#2aa376914b621018c5784104b82c13e78ee51307
        // for an example
        const { line, column } = findLineAndColumn(context.body, url)
        context.report({
          id,
          message: 'Fixes must be a URL, not an issue number.',
          string: url,
          line,
          column,
          level: 'fail'
        })
      } else if (match) {
        if (match[1] === 'pull' && match[2] === undefined) {
          const { line, column } = findLineAndColumn(context.body, url)
          context.report({
            id,
            message: 'Pull request URL must reference a comment or discussion.',
            string: url,
            line,
            column,
            level: 'fail'
          })
        } else {
          const { line, column } = findLineAndColumn(context.body, url)
          context.report({
            id,
            message: 'Valid fixes URL.',
            string: url,
            line,
            column,
            level: 'pass'
          })
        }
      } else {
        const { line, column } = findLineAndColumn(context.body, url)
        context.report({
          id,
          message: 'Fixes must be a GitHub URL.',
          string: url,
          line,
          column,
          level: 'fail'
        })
      }
    }
  }
}

function findLineAndColumn (body, str) {
  for (let i = 0; i < body.length; i++) {
    const l = body[i]
    if (~l.indexOf('Fixes')) {
      const idx = l.indexOf(str)
      if (idx !== -1) {
        return {
          line: i,
          column: idx
        }
      }
    }
  }

  return {
    line: -1,
    column: -1
  }
}
