export default class Rule {
  constructor (opts) {
    opts = Object.assign({
      options: {},
      defaults: {},
      meta: {}
    }, opts)

    if (!opts.id) {
      throw new Error('Rule must have an id')
    }

    if (typeof opts.validate !== 'function') {
      throw new TypeError('Rule must have validate function')
    }

    this.id = opts.id
    this.disabled = opts.disabled === true
    this.meta = opts.meta
    this.defaults = Object.assign({}, opts.defaults)
    this.options = Object.assign({}, opts.defaults, opts.options)
    this._validate = opts.validate
  }

  validate (commit) {
    this._validate(commit, this)
  }
}
