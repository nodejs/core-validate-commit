# Changelog

## [5.0.1](https://github.com/nodejs/core-validate-commit/compare/v5.0.0...v5.0.1) (2026-03-18)


### Bug Fixes

* **rules:** add `config` subsystem ([#129](https://github.com/nodejs/core-validate-commit/issues/129)) ([0371a3d](https://github.com/nodejs/core-validate-commit/commit/0371a3d2c043d3e17f1d0a91b4a7542b06949a42))
* **rules:** add `vfs` subsystem ([#139](https://github.com/nodejs/core-validate-commit/issues/139)) ([d4ebfff](https://github.com/nodejs/core-validate-commit/commit/d4ebfff7417f3cc252da892e27762b8211133e6e))

## [5.0.0](https://github.com/nodejs/core-validate-commit/compare/v4.1.0...v5.0.0) (2026-03-13)


### ⚠ BREAKING CHANGES

* drop support for Node.js 18 ([#133](https://github.com/nodejs/core-validate-commit/issues/133))
* `package.json` now contains `engines.node`

### Features

* add support for stdin JSON input ([#135](https://github.com/nodejs/core-validate-commit/issues/135)) ([3200730](https://github.com/nodejs/core-validate-commit/commit/32007307ca770180991991f6c1682fe5c048a887))
* support co-authorship lines in body ([#130](https://github.com/nodejs/core-validate-commit/issues/130)) ([47e1d6d](https://github.com/nodejs/core-validate-commit/commit/47e1d6d51c2293ddab891ca6e9f2a6d7a93fe711))


### Bug Fixes

* **co-authored-by-is-trailer:** trailers do not have leading spaces ([#136](https://github.com/nodejs/core-validate-commit/issues/136)) ([39b93a3](https://github.com/nodejs/core-validate-commit/commit/39b93a36688cabd4221e6c2e2c1c03c17de6f2e9))


### Miscellaneous Chores

* do not test on EOL Node.js versions ([#124](https://github.com/nodejs/core-validate-commit/issues/124)) ([4556b7c](https://github.com/nodejs/core-validate-commit/commit/4556b7ced175f8802ef32a0cb1af273e9bab5c24))
* drop support for Node.js 18 ([#133](https://github.com/nodejs/core-validate-commit/issues/133)) ([b4dae98](https://github.com/nodejs/core-validate-commit/commit/b4dae98fcf2116e10f46b586710aadf2e883f682))
