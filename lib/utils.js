import chalk from 'chalk'

export const CHECK = chalk.green('✔')
export const X = chalk.red('✖')
export const WARN = chalk.yellow('⚠')

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
      return `${CHECK}  ${chalk.underline(sha)}${suffix}`
    }
    case 'fail':
      return `${X}  ${chalk.underline(sha)}`
  }
}

export function describeRule (rule, max = 20) {
  if (rule.meta && rule.meta.description) {
    const desc = rule.meta.description
    const title = leftPad(rule.id, max)
    console.log(' %s %s', chalk.red(title), chalk.dim(desc))
  }
}

export function describeSubsystem (subsystems, max = 20) {
  if (subsystems) {
    for (let sub = 0; sub < subsystems.length; sub = sub + 3) {
      console.log('%s %s %s',
        chalk.green(leftPad(subsystems[sub] || '', max)),
        chalk.green(leftPad(subsystems[sub + 1] || '', max)),
        chalk.green(leftPad(subsystems[sub + 2] || '', max))
      )
    }
  }
}
