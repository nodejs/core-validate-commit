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

# list all rules
$ core-validate-commit --list
    fixes-url enforce format of Fixes URLs
  line-length enforce max length of lines in commit body
 metadata-end enforce that metadata is at the end of commit messages
       pr-url enforce PR-URL
    reviewers enforce having reviewers
    subsystem enforce subsystem validity
 title-length enforce max length of commit title
```

## Git hook installation

- install `node` and `core-validate-commits` as above
- install this hook in your clone of node (here `~/src/node`):
```
ln -s commit-msg.sh   ~/src/node/.git/hooks/commit-msg
```
- Alternatively, you may be able to pull from the npm-installed package:
```
ln  -s /usr/local/lib/node_modules/core-validate-commit/commit-msg.sh \
          ~/src/node/.git/hooks/commit-msg
```
- make sure `~/src/node/.git/hooks/commit-msg` is executable.

## Test

```bash
$ npm test
```

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
