'use strict'

const benchmark = require('benchmark')
const suite = new benchmark.Suite()

// eslint-disable-next-line
for (var i = 0; i < 10000; i++) {
  if (i % 100 === 0) {
  }
}

suite.add('aaa', function () {
  return 1 + 2
})

suite.add('bbb', function () {
  return 1 + 2 + 3
})

suite.on('cycle', cycle)

suite.run()

function cycle (e) {
  console.log(e.target.toString())
}

