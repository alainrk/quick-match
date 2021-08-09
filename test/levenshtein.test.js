const { test } = require('tap')
const { QuickMatch } = require('..')

test('trivial single choice', (t) => {
  t.plan(2)
  const qm = new QuickMatch({ algorithm: 'levenshtein' })
  const candidates = ['foo']

  const res = qm.run('there is no sense here', candidates)
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'foo')
})

test('trivial case - equal', (t) => {
  t.plan(2)
  const qm = new QuickMatch({ algorithm: 'levenshtein' })
  const candidates = ['foo', 'bar']

  const res = qm.run('foo', candidates)
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'foo')
})

test('trivial case - expected match', (t) => {
  t.plan(2)
  const qm = new QuickMatch({ algorithm: 'levenshtein' })
  const candidates = ['foo', 'bar']

  const res = qm.run('this is foo', candidates)
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'foo')
})

test('longest word has to match', (t) => {
  t.plan(2)
  const qm = new QuickMatch({ algorithm: 'levenshtein' })
  const candidates = ['footestzoo', 'bar', 'word']

  const res = qm.run('bar word footestzoo', candidates)
  t.same(res.bestCandidateIdx, 0)
  t.same(res.bestCandidate.text, 'footestzoo')
})
