'use strict'

const benchmark = require('benchmark')
const suite = new benchmark.Suite()

const { diceCoefficient } = require('../dices')

suite.add('for', function () {
  return diceCoefficient('tiella polpo e pomodoro', 'pizza al pomodoro', 'for')
})

suite.add('foreach', function () {
  return diceCoefficient('tiella polpo e pomodoro', 'pizza al pomodoro', 'foreach')
})

suite.add('for - equal', function () {
  return diceCoefficient('xxxxxxxxxxxxx', 'xxxxxxxxxxxx', 'for')
})

suite.add('foreach - equal', function () {
  return diceCoefficient('xxxxxxxxxxxxx', 'xxxxxxxxxxxx', 'foreach')
})

suite.on('cycle', (e) => {
  console.log(e.target.toString())
})

suite.on('complete', function () {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()

