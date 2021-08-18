const { test } = require('tap')
const { QuickMatch } = require('..')

test('no keywords', (t) => {
  t.plan(3)
  const qm = new QuickMatch({
    algorithm: 'dice',
    enableStemming: true,
    stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
  })
  const candidates = [
    { text: 'Discussing food' },
    { text: 'Eating and running' }
  ]

  const res = qm.run('i have discussed about food', candidates)
  t.same(res.candidates[0].intersections, ['discuss', 'food'])
  t.same(res.candidates[1].intersections, [])
  t.same(res.maxIntersectionsCandidateIdx, 0)
})

test('with keywords', (t) => {
  t.plan(3)
  const qm = new QuickMatch({
    algorithm: 'dice',
    enableStemming: true,
    stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
  })
  const candidates = [
    { text: 'Discussing food', keywords: ['eating', 'meal'] },
    { text: 'Eating and running', keywords: ['jogging', 'footing'] }
  ]

  const res = qm.run('i have discussed about mealing and foot', candidates)
  t.same(res.candidates[0].intersections, ['discuss', 'meal'])
  t.same(res.candidates[1].intersections, ['foot'])
  t.same(res.maxIntersectionsCandidateIdx, 0)
})
