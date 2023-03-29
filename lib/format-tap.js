export default function formatTap (t, context, msgs, validator) {
  for (const m of msgs) {
    switch (m.level) {
      case 'pass': {
        const a = m.string ? ` [${m.string}]` : ''
        t.pass(`${m.id}: ${m.message}${a}`)
        break
      }
      case 'skip':
        t.skip(`${m.id}: ${m.message}`)
        break
      case 'fail':
        onFail(context, m, validator, t)
        break
    }
  }
}

function onFail (context, m, validator, t) {
  switch (m.id) {
    case 'line-length':
    case 'title-length':
      lengthFail(context, m, validator, t)
      break
    case 'subsystem':
      subsystemFail(context, m, validator, t)
      break
    default:
      defaultFail(context, m, validator, t)
      break
  }
}

function lengthFail (context, m, validator, t) {
  const body = m.id === 'title-length'
    ? context.title
    : context.body
  t.fail(`${m.id}: ${m.message}`, {
    found: m.string.length,
    compare: '<=',
    wanted: m.maxLength,
    at: {
      line: m.line || 0,
      column: m.column || 0,
      body
    }
  })
}

function subsystemFail (context, m, validator, t) {
  t.fail(`${m.id}: ${m.message} (${m.string})`, {
    found: m.string,
    compare: 'indexOf() !== -1',
    wanted: m.wanted || '',
    at: {
      line: m.line || 0,
      column: m.column || 0,
      body: m.title
    }
  })
}

function defaultFail (context, m, validator, t) {
  t.fail(`${m.id}: ${m.message} (${m.string})`, {
    found: m.string,
    compare: Array.isArray(m.wanted) ? 'indexOf() !== -1' : '===',
    wanted: m.wanted || '',
    at: {
      line: m.line || 0,
      column: m.column || 0,
      body: context.body
    }
  })
}
