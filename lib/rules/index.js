'use strict'

const fs = require('fs')
const path = require('path')

fs.readdirSync(__dirname).forEach((item) => {
  const fp = path.join(__dirname, item)
  if (path.extname(fp) !== '.js') return
  if (fp === __filename) return
  const rule = require(fp)
  exports[rule.id] = rule
})
