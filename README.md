# core-validate-commit

[![Build Status](https://travis-ci.org/evanlucas/core-validate-commit.svg)](https://travis-ci.org/evanlucas/core-validate-commit)
[![Coverage Status](https://coveralls.io/repos/evanlucas/core-validate-commit/badge.svg?branch=master&service=github)](https://coveralls.io/github/evanlucas/core-validate-commit?branch=master)

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
```

## Test

```bash
$ npm test
```

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
