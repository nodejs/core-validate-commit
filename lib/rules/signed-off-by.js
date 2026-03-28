const id = 'signed-off-by'

// Matches the name and email from a Signed-off-by line
const signoffParts = /^Signed-off-by: (.*) <([^>]+)>/i

// Bot/AI patterns: name ending in [bot], or GitHub bot noreply emails
// This is an imperfect heuristic, but there's no standard way to identify
// bot commits in a reliable, generic way.
const botNamePattern = /\[bot\]$/i
const botEmailPattern = /(?:\[bot\]@users\.noreply\.github\.com|github-bot@iojs\.org)$/i

// Matches "Name <email>" author strings
const authorPattern = /^(.*?)\s*<([^>]+)>/
const signoffPattern = /^Signed-off-by: /i
const validSignoff = /^Signed-off-by: .+ <[^@]+@[^@]+\.[^@]+>/i
const backportPattern = /^Backport-PR-URL:/i

// Parse name and email from an author string like "Name <email>"
function parseAuthor (authorStr) {
  if (!authorStr) return null
  const match = authorStr.match(authorPattern)
  if (!match) return null // Purely defensive check here
  return { name: match[1].trim(), email: match[2].toLowerCase() }
}

// Check if an author string looks like a bot
function isBotAuthor (authorStr) {
  const author = parseAuthor(authorStr)
  if (!author) return false
  return botNamePattern.test(author.name) || botEmailPattern.test(author.email)
}

export default {
  id,
  meta: {
    description: 'enforce DCO sign-off',
    recommended: true
  },
  defaults: {},
  options: {},
  validate: (context, rule) => {
    const parsed = context.toJSON()

    // Release commits generally won't have sign-offs
    if (parsed.release) {
      context.report({
        id,
        message: 'skipping sign-off for release commit',
        string: '',
        level: 'skip'
      })
      return
    }

    // Deps commits are cherry-picks/backports/updates from upstream projects
    // (V8, etc.) and are not expected to have a Signed-off-by. When deps
    // is mixed with other subsystems, a sign-off might be required but we'll
    // downgrade to a warn instead of fail in this case.
    const hasDeps = parsed.subsystems.includes('deps')
    if (hasDeps && parsed.subsystems.every((s) => s === 'deps')) {
      context.report({
        id,
        message: 'skipping sign-off for deps commit',
        string: '',
        level: 'skip'
      })
      return
    }

    // Backport commits (identified by a Backport-PR-URL trailer) are
    // cherry-picks of existing commits into release branches. The
    // original commit was already validated.
    if (parsed.body.some((line) => backportPattern.test(line))) {
      context.report({
        id,
        message: 'skipping sign-off for backport commit',
        string: '',
        level: 'skip'
      })
      return
    }

    const signoffs = parsed.body
      .map((line, i) => [line, i])
      .filter(([line]) => signoffPattern.test(line))

    // Bot-authored commits don't need a sign-off.
    // If they have one, warn; otherwise pass.
    if (isBotAuthor(parsed.author)) {
      if (signoffs.length === 0) {
        context.report({
          id,
          message: 'skipping sign-off for bot commit',
          string: '',
          level: 'pass'
        })
      } else {
        for (const [line, lineNum] of signoffs) {
          context.report({
            id,
            message: 'bot commit should not have a "Signed-off-by" trailer',
            string: line,
            line: lineNum,
            column: 0,
            level: 'warn'
          })
        }
      }
      return
    }

    // Assume it's not a bot commit... a Signed-off-by trailer is required.
    // For mixed deps commits (deps + other subsystems), downgrade to warn
    // since the deps portion may legitimately lack a sign-off.
    if (signoffs.length === 0) {
      context.report({
        id,
        message: hasDeps
          ? 'Commit with non-deps changes should have a "Signed-off-by" trailer'
          : 'Commit must have a "Signed-off-by" trailer',
        string: '',
        level: hasDeps ? 'warn' : 'fail'
      })
      return
    }

    // Flag every sign-off that has an invalid email format.
    // Collect valid sign-offs for further checks.
    const valid = []
    for (const [line, lineNum] of signoffs) {
      if (validSignoff.test(line)) {
        valid.push([line, lineNum])
      } else {
        context.report({
          id,
          message: '"Signed-off-by" trailer has invalid email',
          string: line,
          line: lineNum,
          column: 0,
          level: 'fail'
        })
      }
    }

    if (valid.length === 0) {
      // All sign-offs had invalid emails; already reported above.
      return
    }

    // Flag any sign-off that appears to be from a bot or AI agent.
    // Bots and AI agents are not permitted to sign off on commits.
    // Collect non-bot sign-offs for further checks. If the commit
    // itself appears to be from a bot, the case is handled above.
    const human = []
    for (const [line, lineNum] of valid) {
      const { 1: name, 2: email } = line.match(signoffParts)
      if (botNamePattern.test(name) || botEmailPattern.test(email)) {
        context.report({
          id,
          message: '"Signed-off-by" must be from a human author, ' +
                   'not a bot or AI agent',
          string: line,
          line: lineNum,
          column: 0,
          level: 'warn'
        })
      } else {
        human.push([line, lineNum])
      }
    }

    // All sign-offs appear to be from bots; already reported above.
    // If there are no human sign-offs, fail (or warn for mixed deps).
    if (human.length === 0) {
      context.report({
        id,
        message: hasDeps
          ? 'Commit with non-deps changes should have a "Signed-off-by" ' +
            'trailer from a human author'
          : 'Commit must have a "Signed-off-by" trailer from a human author',
        string: '',
        level: hasDeps ? 'warn' : 'fail'
      })
      return
    }

    // When author info is available, warn if none of the human sign-off
    // emails match the commit author email. This may indicate an automated
    // tool signed off on behalf of the author.
    const authorEmail = parseAuthor(parsed.author)?.email
    if (authorEmail) {
      const authorMatch = human.some(([line]) => {
        const { 2: email } = line.match(signoffParts)
        return email.toLowerCase() === authorEmail
      })
      if (!authorMatch) {
        context.report({
          id,
          message: '"Signed-off-by" email does not match the ' +
                   'commit author email',
          string: human[0][0],
          line: human[0][1],
          column: 0,
          level: 'warn'
        })
        return
      }
    }

    context.report({
      id,
      message: 'has valid Signed-off-by',
      string: '',
      level: 'pass'
    })
  }
}
