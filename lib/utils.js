import { styleText } from 'node:util'

export const CHECK = styleText('green', '✔')
export const X = styleText('red', '✖')
export const WARN = styleText('yellow', '⚠')

export function rightPad (str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${str}${' '.repeat(diff)}`
  }
  return str
}

export function leftPad (str, max) {
  const diff = max - str.length + 1
  if (diff > 0) {
    return `${' '.repeat(diff)}${str}`
  }
  return str
}

export function header (sha, status) {
  switch (status) {
    case 'skip':
    case 'pass': {
      const suffix = status === 'skip' ? ' # SKIPPED' : ''
      return `${CHECK}  ${styleText('underline', sha)}${suffix}`
    }
    case 'fail':
      return `${X}  ${styleText('underline', sha)}`
  }
}

export function describeRule (rule, max = 20) {
  if (rule.meta && rule.meta.description) {
    const desc = rule.meta.description
    const title = leftPad(rule.id, max)
    console.log(' %s %s', styleText('red', title), styleText('dim', desc))
  }
}

export function describeSubsystem (subsystems, max = 20) {
  if (subsystems) {
    for (let sub = 0; sub < subsystems.length; sub = sub + 3) {
      console.log('%s %s %s',
        styleText('green', leftPad(subsystems[sub] || '', max)),
        styleText('green', leftPad(subsystems[sub + 1] || '', max)),
        styleText('green', leftPad(subsystems[sub + 2] || '', max))
      )
    }
  }
}
