const { test } = require('tap')
const { QuickMatch } = require('..')

test('simple digit matches', (t) => {
  t.plan(4)
  const qm = new QuickMatch({ numbers: { enableDigits: true, maxDigit: 5 } })
  const candidates = ['foo', 'bar', 'zoo']

  const res = qm.run('1', candidates)
  t.same(res.numberMatch, true)
  t.same(res.numberMatchType, 'digit')
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'foo')
})

test('simple cardinal matches', (t) => {
  t.plan(4)
  const qm = new QuickMatch({
    numbers:
    {
      enableCardinals: true,
      cardinals: ['uno', 'due', 'tre']
    }
  })
  const candidates = ['foo', 'bar', 'zoo']

  const res = qm.run('la due', candidates)
  t.same(res.numberMatch, true)
  t.same(res.numberMatchType, 'cardinal')
  t.same(res.bestCandidateIdx, 1)
  t.same(res.bestCandidate.text, 'bar')
})

test('simple ordinal matches', (t) => {
  t.plan(4)
  const qm = new QuickMatch({
    numbers:
    {
      enableOrdinals: true,
      ordinals: ['prima', 'seconda', 'terza']
    }
  })
  const candidates = ['foo', 'bar', 'zoo']

  const res = qm.run('seconda scelta', candidates)
  t.same(res.numberMatch, true)
  t.same(res.numberMatchType, 'ordinal')
  t.same(res.bestCandidateIdx, 1)
  t.same(res.bestCandidate.text, 'bar')
})

test('out of bound maxDigit', (t) => {
  t.plan(1)
  const qm = new QuickMatch({ numbers: { enableDigits: true, maxDigit: 3 } })
  const candidates = ['foo', 'bar', 'zoo', 'asd', 'qwe']

  const res = qm.run('5', candidates)
  t.not(res.numberMatch, true)
})

test('out of bound digit candidates', (t) => {
  t.plan(1)
  const qm = new QuickMatch({ numbers: { enableDigits: true, maxDigit: 10 } })
  const candidates = ['foo', 'bar', 'zoo', 'asd', 'qwe']

  const res = qm.run('8', candidates)
  t.not(res.numberMatch, true)
})

test('out of bound ordinal', (t) => {
  t.plan(2)
  const qm = new QuickMatch({
    numbers:
    {
      enableOrdinals: true,
      ordinals: ['prima', 'seconda', 'terza']
    }
  })
  const candidates = ['terza scelta', 'bar']

  const res = qm.run('la terza', candidates)
  t.not(res.numberMatch, false)
  t.same(res.bestCandidateIdx, 0)
})

test('out of bound cardinal', (t) => {
  t.plan(2)
  const qm = new QuickMatch({
    numbers:
    {
      enableCardinals: true,
      cardinals: ['uno', 'due', 'tre']
    }
  })
  const candidates = ['numero tre', 'bar']

  const res = qm.run('scelgo tre', candidates)
  t.not(res.numberMatch, false)
  t.same(res.bestCandidateIdx, 0)
})
