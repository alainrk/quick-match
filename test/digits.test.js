const { test } = require('tap')
const { QuickMatch } = require('..')

test('simple digit matches', (t) => {
  t.plan(3)
  const qm = new QuickMatch({ numbers: { enableDigits: true, maxDigit: 5 } })
  const candidates = ['foo', 'bar', 'zoo']

  const res = qm.run('1', candidates) 
  t.same(res.matchedNumber, true)
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'foo')
})

test('out of bound digit match', (t) => {
  t.plan(2)
  const qm = new QuickMatch({ numbers: { enableDigits: true, maxDigit: 3 } })
  const candidates = ['foo', 'bar', 'zoo', 'asd', 'qwe']

  const res = qm.run('5', candidates) 
  t.not(res.numberMatch, true)
  t.not(res.numberMatchType, 'digit')
})
