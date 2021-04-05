# core-validate-commit

[![Build Status](https://github.com/nodejs/core-validate-commit/actions/workflows/node.js.yml/badge.svg)](https://github.com/nodejs/core-validate-commit/actions/workflows/node.js.yml)
[![codecov](https://img.shields.io/codecov/c/github/nodejs/core-validate-commit.svg?style=flat-square)](https://codecov.io/gh/nodejs/core-validate-commit)

Validate the commit message for a particular commit in node core

## Install

```bash
$ npm install [-g] core-validate-commit
```

## Usage

```bash
# for a single commit
$ core-validate-commit <sha>

# validate since <sha>
$ git rev-list <sha>..HEAD | xargs core-validate-commit

# list all rules
$ core-validate-commit --list
         fixes-url enforce format of Fixes URLs
  line-after-title enforce a blank newline after the commit title
       line-length enforce max length of lines in commit body
      metadata-end enforce that metadata is at the end of commit messages
            pr-url enforce PR-URL
         reviewers enforce having reviewers
         subsystem enforce subsystem validity
      title-format enforce commit title format
      title-length enforce max length of commit title
```

To see a list of valid subsystems:
```bash
$ core-validate-commit --list-subsystem
```

Valid subsystems are also defined in [lib/rules/subsystem.js](./lib/rules/subsystem.js).

## Test

```bash
$ npm test
```

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
