import util from 'node:util'
import { Readable } from 'node:stream'

class Test {
  constructor (tap, name) {
    this.tap = tap
    this.name = name
    this._count = 0
    this._passes = 0
    this._failures = 0
    this._skips = 0
    this.begin()
  }

  pass (msg) {
    this.tap.write(`ok ${++this._count} ${msg}`)
    this._passes++
    this.tap.pass()
  }

  fail (msg, extra) {
    this.tap.write(`not ok ${++this._count} ${msg}`)
    if (extra) {
      this.tap.write('  ---')
      if (typeof extra === 'object') {
        extra = util.inspect(extra)
      }

      if (typeof extra === 'string') {
        extra.split(/\n/).forEach((item) => {
          this.tap.write(`    ${item}`)
        })
      }
      this.tap.write('  ...')
    }
    this._failures++
    this.tap.fail()
  }

  skip (msg) {
    this.tap.write(`ok ${++this._count} ${msg} # SKIP`)
    this._skips++
    this.tap.skip()
  }

  begin () {
    this.tap.write(`# ${this.name}`)
  }
}

export default class Tap extends Readable {
  constructor () {
    super()
    this._wroteVersion = false
    this._count = 0
    this._passes = 0
    this._failures = 0
    this._skips = 0
  }

  get status () {
    if (this._failures) {
      return 'fail'
    }

    return 'pass'
  }

  writeVersion () {
    if (!this._wroteVersion) {
      this.write('TAP version 13')
      this._wroteVersion = true
    }
  }

  pass () {
    this._passes++
    this._count++
  }

  fail () {
    this._failures++
    this._count++
  }

  skip () {
    this._skips++
    this._count++
  }

  write (str = '') {
    this.push(`${str}\n`)
  }

  test (name) {
    const t = new Test(this, name)
    return t
  }

  _read () {}

  end () {
    this.write()
    this.write(`0..${this._count}`)
    this.write(`# tests ${this._count}`)
    if (this._passes) {
      this.write(`# pass  ${this._passes}`)
    }

    if (this._failures) {
      this.write(`# fail  ${this._failures}`)
      this.write('# Please review the commit message guidelines:')
      this.write('# https://github.com/nodejs/node/blob/HEAD/doc/contributing/pull-requests.md#commit-message-guidelines')
    }

    this.push(null)
  }
}
